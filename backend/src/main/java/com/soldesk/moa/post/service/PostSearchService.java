package com.soldesk.moa.post.service;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Slice;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.client.RestClientException;

import com.soldesk.moa.board.entity.constant.BoardType;
import com.soldesk.moa.common.exception.InvalidRequestException;
import com.soldesk.moa.common.search.dto.SearchPage;
import com.soldesk.moa.post.dto.PostSearchDocument;
import com.soldesk.moa.post.dto.PostSearchHitDTO;
import com.soldesk.moa.post.dto.PostSearchRequestDTO;
import com.soldesk.moa.post.dto.PostSearchTarget;
import com.soldesk.moa.post.entity.Post;
import com.soldesk.moa.post.entity.PostSearchEntity;
import com.soldesk.moa.post.repository.PostRepository;
import com.soldesk.moa.post.repository.PostSearchRepository;
import com.soldesk.moa.post.search.DbPostSearchExecutor;
import com.soldesk.moa.post.search.MeiliPostSearchExecutor;
import com.soldesk.moa.post.search.PostDomainSearchSupport;
import com.soldesk.moa.post.search.PostSearchEngineType;
import com.soldesk.moa.reply.repository.ReplyRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Service
@RequiredArgsConstructor
@Log4j2
public class PostSearchService {

    private static final String INDEX_UID = "posts";
    private static final int BLOCKED_SINGLE_KEYWORD_LENGTH = 1;

    private final PostDomainSearchSupport postDomainSearchSupport;
    private final PostRepository postRepository;
    private final PostSearchRepository postSearchRepository;
    private final ReplyRepository replyRepository;
    private final MeiliPostSearchExecutor meiliPostSearchExecutor;
    private final DbPostSearchExecutor dbPostSearchExecutor;

    public void queueUpsertAfterCommit(Long postId) {
        if (postId == null) {
            return;
        }

        // DB fallback 검색의 일관성을 위해 post_search는 즉시 동기화한다.
        Optional<PostSearchEntity> savedSearchEntity = upsertSearchTable(postId);

        if (!postDomainSearchSupport.enabled()) {
            return;
        }

        // Meilisearch는 커밋 이후 동기화한다.
        runAfterCommit(() -> safeRun(() -> upsert(postId, savedSearchEntity), "upsert", postId));
    }

    public void queueDeleteAfterCommit(Long postId) {
        if (postId == null) {
            return;
        }

        // DB fallback 검색의 일관성을 위해 post_search는 즉시 동기화한다.
        deleteSearchTable(postId);

        if (!postDomainSearchSupport.enabled()) {
            return;
        }

        // Meilisearch는 커밋 이후 동기화한다.
        runAfterCommit(() -> safeRun(() -> postDomainSearchSupport.deleteByPostId(postId), "delete", postId));
    }

    public long reindexAll(Integer requestedBatchSize) {
        int batchSize = safeBatchSize(requestedBatchSize);
        boolean meiliEnabled = postDomainSearchSupport.enabled();
        if (meiliEnabled) {
            try {
                ensureIndexConfigured();
            } catch (RestClientException | IllegalStateException e) {
                log.warn("[#SEARCH] Meilisearch 인덱스 초기화 실패, DB 검색 인덱싱만 진행합니다. message={}", e.getMessage());
                meiliEnabled = false;
            }
        }

        long indexedCount = 0L;
        int page = 0;

        while (true) {
            Slice<Post> slice = postRepository.findActivePostsForSearchIndex(PageRequest.of(page, batchSize));
            if (slice.isEmpty()) {
                break;
            }

            List<PostSearchEntity> searchEntities = slice.getContent().stream()
                    .map(this::toSearchEntity)
                    .toList();
            postSearchRepository.saveAll(searchEntities);
            indexedCount += searchEntities.size();

            if (meiliEnabled) {
                try {
                    List<PostSearchDocument> documents = searchEntities.stream()
                            .map(this::toDocument)
                            .toList();
                    postDomainSearchSupport.upsertDocuments(documents);
                } catch (RestClientException | IllegalStateException e) {
                    log.warn("[#SEARCH] Meilisearch 배치 동기화 실패, 남은 배치는 DB 검색 인덱싱만 진행합니다. message={}", e.getMessage());
                    meiliEnabled = false;
                }
            }

            if (!slice.hasNext()) {
                break;
            }
            page++;
        }

        return indexedCount;
    }

    public long deletePostIndex() {
        if (!postDomainSearchSupport.enabled()) {
            return -1L;
        }
        return postDomainSearchSupport.deleteIndex();
    }

    public SearchPage<PostSearchHitDTO> search(PostSearchRequestDTO request, Long userId) {
        String keyword = defaultString(request.getQ()).trim();
        validateKeyword(keyword);
        String normalizedKeyword = normalizeKeyword(keyword);
        int page = safePage(request.getPage());
        int size = safeSize(request.getSize());
        PostSearchTarget target = request.getTarget() == null ? PostSearchTarget.ALL : request.getTarget();
        BoardType boardType = request.getBoardType();
        Long boardId = request.getBoardId();
        Long circleId = request.getCircleId();
        String filter = buildFilter(boardType, boardId, circleId, userId);
        boolean excludeActivityInCircleSearch = boardType == BoardType.CIRCLE && boardId == null;

        PostSearchEngineType primaryEngine = excludeActivityInCircleSearch
                ? PostSearchEngineType.DB
                : resolvePrimaryEngine();
        if (primaryEngine == PostSearchEngineType.DB) {
            return dbPostSearchExecutor.search(normalizedKeyword, target, boardType, boardId, circleId, page, size,
                    filter);
        }

        try {
            return meiliPostSearchExecutor.search(normalizedKeyword, target, boardType, boardId, circleId, page, size,
                    filter);
        } catch (RestClientException | IllegalStateException e) {
            log.warn("[#SEARCH] Meilisearch 실패로 DB fallback 검색을 수행합니다. index={}, message={}", INDEX_UID, e.getMessage());
            return dbPostSearchExecutor.search(normalizedKeyword, target, boardType, boardId, circleId, page, size,
                    filter);
        }
    }

    private void upsert(Long postId, Optional<PostSearchEntity> savedSearchEntity) {
        ensureIndexConfigured();
        savedSearchEntity.ifPresentOrElse(
                entity -> postDomainSearchSupport.upsertDocuments(List.of(toDocument(entity))),
                () -> postDomainSearchSupport.deleteByPostId(postId));
    }

    private Optional<PostSearchEntity> upsertSearchTable(Long postId) {
        return postRepository.findActivePostForSearchIndex(postId)
                .map(this::toSearchEntity)
                .map(postSearchRepository::save)
                .or(() -> {
                    postSearchRepository.findById(postId).ifPresent(postSearchRepository::delete);
                    return Optional.empty();
                });
    }

    private void deleteSearchTable(Long postId) {
        postSearchRepository.findById(postId).ifPresent(postSearchRepository::delete);
    }

    private String buildFilter(BoardType boardType, Long boardId, Long circleId, Long userId) {
        if (boardType == BoardType.CIRCLE) {
            if (circleId == null) {
                throw new InvalidRequestException("[#POST] CIRCLE 검색에는 circleId가 필요합니다.");
            }
            if (boardId != null) {
                return "boardType = 'CIRCLE' AND circleId = " + circleId + " AND boardId = " + boardId;
            }
            return "boardType = 'CIRCLE' AND circleId = " + circleId;
        }

        if (boardId != null) {
            return "boardId = " + boardId;
        }

        if (boardType == null) {
            return "boardType != 'CIRCLE'";
        }

        return "boardType = '" + boardType.name() + "'";
    }

    private void ensureIndexConfigured() {
        postDomainSearchSupport.ensureConfigured();
    }

    private void safeRun(Runnable action, String operation, Long postId) {
        try {
            action.run();
        } catch (RestClientException e) {
            log.warn("[#SEARCH] Meilisearch {} 동기화 실패(무시). postId={}, message={}", operation, postId, e.getMessage());
        }
    }

    private void runAfterCommit(Runnable action) {
        if (!TransactionSynchronizationManager.isActualTransactionActive()) {
            action.run();
            return;
        }

        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                action.run();
            }
        });
    }

    private int safePage(Integer page) {
        if (page == null || page < 1) {
            return 1;
        }
        return page;
    }

    private int safeSize(Integer size) {
        if (size == null || size < 1) {
            return 20;
        }
        return Math.min(size, 100);
    }

    private int safeBatchSize(Integer size) {
        if (size == null || size < 1) {
            return 500;
        }
        return Math.min(size, 2000);
    }

    private String defaultString(String value) {
        return value == null ? "" : value;
    }

    private void validateKeyword(String keyword) {
        if (keyword.length() == BLOCKED_SINGLE_KEYWORD_LENGTH) {
            throw new InvalidRequestException("[#POST] 검색어는 2자 이상 입력해주세요.");
        }
    }

    private String normalizeKeyword(String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return "";
        }
        if (!containsCompatibilityJamo(keyword)) {
            return keyword;
        }
        return postDomainSearchSupport.toChosung(keyword);
    }

    private boolean containsCompatibilityJamo(String value) {
        if (value == null || value.isBlank()) {
            return false;
        }
        for (int i = 0; i < value.length(); i++) {
            char c = value.charAt(i);
            if (c >= 0x3131 && c <= 0x314E) {
                return true;
            }
        }
        return false;
    }

    private String stripHtml(String value) {
        if (value == null || value.isBlank()) {
            return "";
        }
        return value.replaceAll("<[^>]*>", " ").replaceAll("\\s+", " ").trim();
    }

    private PostSearchEngineType resolvePrimaryEngine() {
        return postDomainSearchSupport.enabled()
                ? PostSearchEngineType.MEILI
                : PostSearchEngineType.DB;
    }

    private PostSearchEntity toSearchEntity(Post post) {
        BoardType boardType = post.getBoardId().getBoardType();
        Long circleId = post.getBoardId().getCircleId() == null ? null : post.getBoardId().getCircleId().getCircleId();
        String title = defaultString(post.getTitle());
        String content = stripHtml(post.getContent());
        String authorName = defaultString(post.getUserId().getNickname());

        return PostSearchEntity.builder()
                .postId(post.getPostId())
                .boardId(post.getBoardId().getBoardId())
                .boardType(boardType)
                .circleId(circleId)
                .title(title)
                .titleChosung(postDomainSearchSupport.toChosung(title))
                .content(content)
                .contentChosung(postDomainSearchSupport.toChosung(content))
                .authorName(authorName)
                .authorNameChosung(postDomainSearchSupport.toChosung(authorName))
                .authorPublicId(post.getUserId().getPublicId())
                .viewCount(post.getViewCount())
                .likeCount(post.getLikeCount())
                .createDate(post.getCreateDate())
                .updateDate(post.getUpdateDate())
                .build();
    }

    private PostSearchDocument toDocument(PostSearchEntity searchEntity) {
        long replyCount = replyRepository.countByPostId_PostIdAndDeletedFalse(searchEntity.getPostId());

        return PostSearchDocument.builder()
                .id(searchEntity.getPostId().toString())
                .postId(searchEntity.getPostId())
                .boardId(searchEntity.getBoardId())
                .boardType(searchEntity.getBoardType())
                .circleId(searchEntity.getCircleId())
                .title(defaultString(searchEntity.getTitle()))
                .content(defaultString(searchEntity.getContent()))
                .authorName(defaultString(searchEntity.getAuthorName()))
                .authorPublicId(searchEntity.getAuthorPublicId())
                .titleChosung(defaultString(searchEntity.getTitleChosung()))
                .contentChosung(defaultString(searchEntity.getContentChosung()))
                .authorNameChosung(defaultString(searchEntity.getAuthorNameChosung()))
                .viewCount(searchEntity.getViewCount())
                .likeCount(searchEntity.getLikeCount())
                .replyCount(replyCount)
                .createDate(searchEntity.getCreateDate())
                .updateDate(searchEntity.getUpdateDate())
                .build();
    }

}
