package com.soldesk.moa.post.search;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;

import com.soldesk.moa.board.entity.constant.BoardType;
import com.soldesk.moa.common.search.dto.SearchPage;
import com.soldesk.moa.post.dto.PostSearchHitDTO;
import com.soldesk.moa.post.dto.PostSearchTarget;
import com.soldesk.moa.post.entity.PostSearchEntity;
import com.soldesk.moa.post.repository.PostSearchRepository;
import com.soldesk.moa.reply.repository.ReplyRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class DbPostSearchExecutor implements PostSearchExecutor {

    private final PostSearchRepository postSearchRepository;
    private final ReplyRepository replyRepository;

    @Override
    public PostSearchEngineType type() {
        return PostSearchEngineType.DB;
    }

    @Override
    public SearchPage<PostSearchHitDTO> search(
            String keyword,
            PostSearchTarget target,
            BoardType boardType,
            Long boardId,
            Long circleId,
            int page,
            int size,
            String filter) {
        Page<PostSearchEntity> pageResult = postSearchRepository.searchPostsForFallback(
                keyword,
                target.name(),
                boardType,
                boardId,
                circleId,
                PageRequest.of(page - 1, size));

        List<PostSearchHitDTO> hits = pageResult.getContent().stream()
                .map(this::toHit)
                .toList();

        return SearchPage.<PostSearchHitDTO>builder()
                .hits(hits)
                .totalHits((int) pageResult.getTotalElements())
                .page(page)
                .totalPages(pageResult.getTotalPages())
                .processingTimeMs(0L)
                .query(keyword)
                .build();
    }

    private PostSearchHitDTO toHit(PostSearchEntity searchEntity) {
        long replyCount = replyRepository.countByPostId_PostIdAndDeletedFalse(searchEntity.getPostId());

        return PostSearchHitDTO.builder()
                .id(searchEntity.getPostId().toString())
                .postId(searchEntity.getPostId())
                .boardId(searchEntity.getBoardId())
                .boardType(searchEntity.getBoardType())
                .circleId(searchEntity.getCircleId())
                .title(defaultString(searchEntity.getTitle()))
                .content(defaultString(searchEntity.getContent()))
                .authorName(defaultString(searchEntity.getAuthorName()))
                .authorPublicId(searchEntity.getAuthorPublicId())
                .viewCount(searchEntity.getViewCount())
                .likeCount(searchEntity.getLikeCount())
                .replyCount(replyCount)
                .createDate(searchEntity.getCreateDate())
                .updateDate(searchEntity.getUpdateDate())
                .build();
    }

    private String defaultString(String value) {
        return value == null ? "" : value;
    }
}

