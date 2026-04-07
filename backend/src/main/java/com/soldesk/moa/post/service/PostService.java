package com.soldesk.moa.post.service;

import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.HashSet;
import java.util.Set;
import java.util.Comparator;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.soldesk.moa.board.entity.Board;
import com.soldesk.moa.board.entity.constant.BoardType;
import com.soldesk.moa.board.entity.constant.CircleBoardKind;
import com.soldesk.moa.board.repository.BoardRepository;
import com.soldesk.moa.board.service.CirclePermissionService;
import com.soldesk.moa.common.exception.InvalidRequestException;
import com.soldesk.moa.common.search.dto.SearchPage;
import com.soldesk.moa.common.entity.Image;
import com.soldesk.moa.common.entity.constant.ImageDomain;
import com.soldesk.moa.common.entity.constant.ImageStatus;
import com.soldesk.moa.common.repository.ImageRepository;
import com.soldesk.moa.common.search.util.HangulChosungTextUtils;
import com.soldesk.moa.common.service.ProfanityFilterService;
import com.soldesk.moa.post.dto.PostRequestDTO;
import com.soldesk.moa.post.dto.PostBookmarkSummaryDTO;
import com.soldesk.moa.post.dto.CommunityMyReplyDTO;
import com.soldesk.moa.post.dto.PostSearchTarget;
import com.soldesk.moa.post.dto.PostReactionSummaryDTO;
import com.soldesk.moa.post.dto.PostResponseDTO;
import com.soldesk.moa.post.dto.CommunitySidebarPostDTO;
import com.soldesk.moa.post.entity.PostBookmark;
import com.soldesk.moa.post.entity.Post;
import com.soldesk.moa.post.entity.PostReaction;
import com.soldesk.moa.post.entity.PostViewLog;
import com.soldesk.moa.post.entity.constant.NoticeCategory;
import com.soldesk.moa.post.entity.constant.PostReactionType;
import com.soldesk.moa.post.exception.PostForbiddenException;
import com.soldesk.moa.post.exception.PostNotFoundException;
import com.soldesk.moa.post.repository.PostReactionRepository;
import com.soldesk.moa.post.repository.PostBookmarkRepository;
import com.soldesk.moa.post.repository.PostRepository;
import com.soldesk.moa.post.repository.PostViewLogRepository;
import com.soldesk.moa.reply.repository.ReplyRepository;
import com.soldesk.moa.auth.dto.AuthUserDTO;
import com.soldesk.moa.users.entity.Users;
import com.soldesk.moa.users.repository.UsersRepository;
import com.soldesk.moa.notification.domain.NotificationType;
import com.soldesk.moa.notification.service.NotificationService;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Log4j2
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PostService {

        private static final ImageDomain POST_IMAGE_DOMAIN = ImageDomain.POST;
        private static final int MAX_PINNED_NOTICE_COUNT = 5;
        private static final Pattern IMG_SRC_PATTERN = Pattern.compile("<img[^>]*\\bsrc\\s*=\\s*['\\\"]([^'\\\"]+)['\\\"][^>]*>",
                        Pattern.CASE_INSENSITIVE);
        private static final Pattern HTML_TAG_PATTERN = Pattern.compile("<[^>]*>");
        private static final Pattern HTML_NBSP_PATTERN = Pattern.compile("&nbsp;", Pattern.CASE_INSENSITIVE);
        private static final Pattern WHITESPACE_PATTERN = Pattern.compile("\\s+");

        private final PostRepository postRepository;
        private final ReplyRepository replyRepository;
        private final BoardRepository boardRepository;
        private final UsersRepository usersRepository;
        private final CirclePermissionService circlePermissionService;
        private final ImageRepository imageRepository;
        private final PostViewLogRepository postViewLogRepository;
        private final ProfanityFilterService profanityFilterService;
        private final PostReactionRepository postReactionRepository;
        private final PostBookmarkRepository postBookmarkRepository;
        private final PostSearchService postSearchService;
        private final NotificationService notificationService;

        // ===== Global =====

        // // 글로벌 게시판 리스트
        // public List<PostResponseDTO> listGlobal(BoardType type) {
        // return postRepository.findGlobalPosts(type).stream()
        // .map(this::toPostResponse)
        // .toList();
        // }

        // 글로벌 게시판 리스트(댓글 포함)
        public List<PostResponseDTO> listGlobal(BoardType type) {
                List<PostResponseDTO> list = postRepository.findGlobalPostsWithReplyCount(type).stream()
                                .map(this::toPostResponseWithCount)
                                .toList();
                if (type == BoardType.NOTICE) {
                        return sortWithPinnedPriority(list);
                }
                return list;
        }

        public List<PostResponseDTO> listGlobalByBoardId(Long boardId) {
                Board board = getGlobalBoardOrThrow(boardId);
                List<PostResponseDTO> list = postRepository.findGlobalPostsWithReplyCountByBoardId(board.getBoardId())
                                .stream()
                                .map(this::toPostResponseWithCount)
                                .toList();
                if (board.getBoardType() == BoardType.NOTICE) {
                        return sortWithPinnedPriority(list);
                }
                return list;
        }

        public List<PostResponseDTO> listCommunity(BoardType boardType, Long globalBoardId) {
                if (globalBoardId != null) {
                        return listGlobalByBoardId(globalBoardId);
                }
                if (boardType == BoardType.NOTICE || boardType == BoardType.FREE) {
                        return listGlobal(boardType);
                }

                List<PostResponseDTO> merged = new ArrayList<>();
                merged.addAll(listGlobal(BoardType.NOTICE));
                merged.addAll(listGlobal(BoardType.FREE));
                merged = sortWithPinnedPriority(merged);
                return merged;
        }

        public List<PostResponseDTO> listCommunity(BoardType boardType) {
                return listCommunity(boardType, null);
        }

        public SearchPage<PostResponseDTO> listCommunityPaged(
                        BoardType boardType,
                        Long globalBoardId,
                        Integer page,
                        Integer size) {
                long startedAt = System.currentTimeMillis();
                int safePage = safePage(page);
                int safeSize = safeSize(size);
                BoardType normalizedBoardType = normalizeSidebarBoardType(boardType);

                Page<Object[]> result = postRepository.findCommunityPostsPaged(
                                normalizedBoardType,
                                globalBoardId,
                                PageRequest.of(safePage - 1, safeSize));

                List<PostResponseDTO> hits = result.getContent().stream()
                                .map(this::toPostResponseWithCount)
                                .toList();

                return SearchPage.<PostResponseDTO>builder()
                                .hits(hits)
                                .totalHits((int) result.getTotalElements())
                                .page(safePage)
                                .totalPages(result.getTotalPages())
                                .processingTimeMs(System.currentTimeMillis() - startedAt)
                                .query("")
                                .build();
        }

        public SearchPage<PostResponseDTO> listCommunityPaged(BoardType boardType, Integer page, Integer size) {
                return listCommunityPaged(boardType, null, page, size);
        }

        public List<CommunitySidebarPostDTO> listCommunitySidebar(
                        BoardType boardType,
                        Long globalBoardId,
                        String sort,
                        Integer limit) {
                int cappedLimit = safeSidebarLimit(limit);
                String normalizedSort = normalizeSidebarSort(sort);
                BoardType normalizedBoardType = normalizeSidebarBoardType(boardType);

                List<Object[]> rows = switch (normalizedSort) {
                        case "views" -> postRepository.findCommunityPostsByViews(
                                        normalizedBoardType,
                                        globalBoardId,
                                        PageRequest.of(0, cappedLimit));
                        case "replies" -> postRepository.findCommunityPostsByReplies(
                                        normalizedBoardType,
                                        globalBoardId,
                                        PageRequest.of(0, cappedLimit));
                        default -> postRepository.findCommunityPostsByRecent(
                                        normalizedBoardType,
                                        globalBoardId,
                                        PageRequest.of(0, cappedLimit));
                };

                return rows.stream()
                                .map(this::toCommunitySidebarPost)
                                .toList();
        }

        public List<CommunitySidebarPostDTO> listCommunitySidebar(BoardType boardType, String sort, Integer limit) {
                return listCommunitySidebar(boardType, null, sort, limit);
        }

        public PostResponseDTO readGlobal(BoardType type, Long postId, Long viewerUserId) {
                Post post = postRepository.findGlobalPost(type, postId)
                                .orElseThrow(() -> new PostNotFoundException("[#POST] 게시글을 찾을 수 없습니다."));
                return toPostResponse(post, viewerUserId);
        }

        public PostResponseDTO readGlobalByBoardId(Long boardId, Long postId, Long viewerUserId) {
                Board board = getGlobalBoardOrThrow(boardId);
                Post post = postRepository.findGlobalPostByBoardId(board.getBoardId(), postId)
                                .orElseThrow(() -> new PostNotFoundException("[#POST] 게시글을 찾을 수 없습니다."));
                return toPostResponse(post, viewerUserId);
        }

        @Transactional
        public Long createGlobal(BoardType type, AuthUserDTO auth, PostRequestDTO req) {
                validatePostText(req);

                Board board = boardRepository.findByBoardTypeAndCircleIdIsNullAndDeletedFalse(type)
                                .orElseThrow(() -> new PostNotFoundException("[#POST] 글로벌 게시판을 찾을 수 없습니다."));
                return createGlobal(board, auth, req);
        }

        @Transactional
        public Long createGlobalByBoardId(Long boardId, AuthUserDTO auth, PostRequestDTO req) {
                validatePostText(req);
                Board board = getGlobalBoardOrThrow(boardId);
                return createGlobal(board, auth, req);
        }

        private Long createGlobal(Board board, AuthUserDTO auth, PostRequestDTO req) {
                Users user = usersRepository.findById(auth.getUserId())
                                .orElseThrow(() -> new PostNotFoundException("[#POST] 사용자를 찾을 수 없습니다."));

                if (board.getBoardType() == BoardType.NOTICE && !isAdmin(auth)) {
                        throw new PostForbiddenException("[#POST] 공지 게시판은 관리자만 작성할 수 있습니다.");
                }

                Post post = Post.builder()
                                .boardId(board)
                                .title(req.getTitle())
                                .content(req.getContent())
                                .userId(user)
                                .noticeCategory(resolveNoticeCategory(board.getBoardType(), req.getNoticeCategory()))
                                .build();

                Post saved = postRepository.save(post);
                syncPostImages(saved, user, req.getContent());
                postSearchService.queueUpsertAfterCommit(saved.getPostId());
                return saved.getPostId();
        }

        @Transactional
        public Long updateGlobal(BoardType type, Long postId, PostRequestDTO req) {
                validatePostText(req);

                Post post = postRepository.findGlobalPost(type, postId)
                                .orElseThrow(() -> new PostNotFoundException("[#POST] 게시글을 찾을 수 없습니다."));
                post.changeTitle(req.getTitle());
                post.changeContent(req.getContent());
                if (type == BoardType.NOTICE) {
                        post.changeNoticeCategory(resolveNoticeCategory(type, req.getNoticeCategory()));
                }
                syncPostImages(post, post.getUserId(), req.getContent());
                postSearchService.queueUpsertAfterCommit(post.getPostId());
                return post.getPostId();
        }

        @Transactional
        public Long updateGlobalByBoardId(Long boardId, Long postId, AuthUserDTO auth, PostRequestDTO req) {
                validatePostText(req);
                Board board = getGlobalBoardOrThrow(boardId);
                Post post = postRepository.findGlobalPostByBoardId(board.getBoardId(), postId)
                                .orElseThrow(() -> new PostNotFoundException("[#POST] 게시글을 찾을 수 없습니다."));

                if (board.getBoardType() == BoardType.NOTICE) {
                        if (!isAdmin(auth)) {
                                throw new PostForbiddenException("[#POST] 공지 게시판은 관리자만 수정할 수 있습니다.");
                        }
                } else if (!isOwner(post, auth.getUserId()) && !isAdmin(auth)) {
                        throw new PostForbiddenException("[#POST] 작성자만 수정할 수 있습니다.");
                }

                post.changeTitle(req.getTitle());
                post.changeContent(req.getContent());
                if (board.getBoardType() == BoardType.NOTICE) {
                        post.changeNoticeCategory(resolveNoticeCategory(board.getBoardType(), req.getNoticeCategory()));
                }
                syncPostImages(post, post.getUserId(), req.getContent());
                postSearchService.queueUpsertAfterCommit(post.getPostId());
                return post.getPostId();
        }

        @Transactional
        public void deleteGlobal(BoardType type, Long postId) {
                Post post = postRepository.findGlobalPost(type, postId)
                                .orElseThrow(() -> new PostNotFoundException("[#POST] 게시글을 찾을 수 없습니다."));
                deletePostWithReplies(post);
                postSearchService.queueDeleteAfterCommit(post.getPostId());
        }

        @Transactional
        public void deleteGlobalByBoardId(Long boardId, Long postId, AuthUserDTO auth) {
                Board board = getGlobalBoardOrThrow(boardId);
                Post post = postRepository.findGlobalPostByBoardId(board.getBoardId(), postId)
                                .orElseThrow(() -> new PostNotFoundException("[#POST] 게시글을 찾을 수 없습니다."));

                if (board.getBoardType() == BoardType.NOTICE) {
                        if (!isAdmin(auth)) {
                                throw new PostForbiddenException("[#POST] 공지 게시판은 관리자만 삭제할 수 있습니다.");
                        }
                } else if (!isOwner(post, auth.getUserId()) && !isAdmin(auth)) {
                        throw new PostForbiddenException("[#POST] 작성자만 삭제할 수 있습니다.");
                }

                deletePostWithReplies(post);
                postSearchService.queueDeleteAfterCommit(post.getPostId());
        }

        // ===== FREE (작성자 검증) =====

        @Transactional
        public Long updateFreeAsOwner(Long postId, AuthUserDTO auth, PostRequestDTO req) {
                validatePostText(req);

                Post post = postRepository.findGlobalPost(BoardType.FREE, postId)
                                .orElseThrow(() -> new PostNotFoundException("[#POST] 게시글을 찾을 수 없습니다."));

                if (!isOwner(post, auth.getUserId())) {
                        throw new PostForbiddenException("[#POST] 작성자만 수정할 수 있습니다.");
                }

                post.changeTitle(req.getTitle());
                post.changeContent(req.getContent());
                syncPostImages(post, post.getUserId(), req.getContent());
                postSearchService.queueUpsertAfterCommit(post.getPostId());
                return post.getPostId();
        }

        @Transactional
        public void deleteFreeAsOwner(Long postId, AuthUserDTO auth) {
                Post post = postRepository.findGlobalPost(BoardType.FREE, postId)
                                .orElseThrow(() -> new PostNotFoundException("[#POST] 게시글을 찾을 수 없습니다."));

                if (!isOwner(post, auth.getUserId()) && !isAdmin(auth)) {
                        throw new PostForbiddenException("[#POST] 작성자만 삭제할 수 있습니다.");
                }

                deletePostWithReplies(post);
                postSearchService.queueDeleteAfterCommit(post.getPostId());
        }

        // ===== Circle =====

        // // 써클보드 게시글 리스트
        // public List<PostResponseDTO> listCircle(Long circleId, Long boardId) {
        // return postRepository.findCirclePosts(circleId, boardId).stream()
        // .map(this::toPostResponse)
        // .toList();
        // }

        // 써클보드 게시글 리스트(댓글 포함)
        public List<PostResponseDTO> listCircle(Long circleId, Long boardId, Long userId) {
                return postRepository.findCirclePostsWithReplyCount(circleId, boardId).stream()
                                .map(this::toPostResponseWithCount)
                                .toList();
        }

        // // 써클보드 전체 게시글 리스트
        // public List<PostResponseDTO> listCircleAllBoardsPosts(Long circleId) {
        // return postRepository.findCirclePostsAllBoards(circleId).stream()
        // .map(this::toPostResponse)
        // .toList();
        // }

        // 써클보드 전체 게시글 리스트(댓글 포함)
        public List<PostResponseDTO> listCircleAllBoardsPosts(Long circleId, Long userId, CircleBoardKind circleBoardKind) {
                return postRepository.findCirclePostsAllBoardsWithReplyCount(circleId).stream()
                                .filter(row -> includeInCircleBoardLists(isActivityCirclePost(row[0]), circleBoardKind))
                                .map(this::toPostResponseWithCount)
                                .toList();
        }

        public List<PostResponseDTO> listPublicCircleActivities(Integer size) {
                int limit = safeSize(size);
                return postRepository.findPublicCircleActivityPostsWithReplyCount(PageRequest.of(0, limit)).stream()
                                .map(this::toPostResponseWithCount)
                                .toList();
        }

        public List<PostResponseDTO> listMyMemberPublicActivityPosts(Long userId) {
                return postRepository.findMyMemberPublicActivityPosts(userId).stream()
                                .map(post -> toPostResponse(post, userId))
                                .toList();
        }

        public List<PostResponseDTO> listMyBookmarkedMemberPublicActivityPosts(Long userId) {
                return postBookmarkRepository.findBookmarkedMemberPublicActivityPostsByUserId(userId).stream()
                                .map(post -> toPostResponse(post, userId))
                                .toList();
        }

        public List<CommunityMyReplyDTO> listMyMemberPublicActivityReplies(Long userId) {
                return replyRepository.findMyMemberPublicActivityReplies(userId).stream()
                                .map(reply -> CommunityMyReplyDTO.builder()
                                                .replyId(reply.getReplyId())
                                                .content(reply.getContent())
                                                .likeCount(reply.getLikeCount())
                                                .createDate(reply.getCreateDate())
                                                .postId(reply.getPostId().getPostId())
                                                .postTitle(reply.getPostId().getTitle())
                                                .boardId(reply.getPostId().getBoardId().getBoardId())
                                                .circleId(reply.getPostId().getBoardId().getCircleId() != null
                                                                ? reply.getPostId().getBoardId().getCircleId().getCircleId()
                                                                : null)
                                                .boardName(reply.getPostId().getBoardId().getName())
                                                .boardType(reply.getPostId().getBoardId().getBoardType())
                                                .build())
                                .toList();
        }

        public PostResponseDTO readPublicCircleActivity(Long postId, Long viewerUserId) {
                Post post = postRepository.findPublicCircleActivityPost(postId)
                                .orElseThrow(() -> new PostNotFoundException("[#POST] 공개 모임활동 게시글을 찾을 수 없습니다."));
                return toPostResponse(post, viewerUserId);
        }

        public PostResponseDTO readCircle(Long circleId, Long boardId, Long postId, Long userId) {
                Post post = postRepository.findCirclePost(circleId, boardId, postId)
                                .orElseThrow(() -> new PostNotFoundException("[#POST] 게시글을 찾을 수 없습니다."));
                return toPostResponse(post, userId);
        }

        @Transactional
        public Long createCircle(Long circleId, Long boardId, Long userId, PostRequestDTO req) {
                validatePostText(req);

                circlePermissionService.requireActiveMember(circleId, userId);

                // 2) board가 circle에 속한 CIRCLE board인지 검증
                Board board = boardRepository
                                .findByBoardIdAndBoardTypeAndCircleId_CircleIdAndDeletedFalse(boardId,
                                                BoardType.CIRCLE,
                                                circleId)
                                .orElseThrow(() -> new PostForbiddenException("[#POST] 해당 게시판은 이 써클에 속하지 않습니다."));

                Users user = usersRepository.findById(userId)
                                .orElseThrow(() -> new PostNotFoundException("[#POST] 사용자를 찾을 수 없습니다."));

                Post post = Post
                                .builder()
                                .boardId(board)
                                .title(req.getTitle())
                                .content(req.getContent())
                                .userId(user)
                                .activityPublic(resolveActivityPublic(board, req.getActivityPublic()))
                                .build();

                Post saved = postRepository.save(post);
                syncPostImages(saved, user, req.getContent());
                postSearchService.queueUpsertAfterCommit(saved.getPostId());
                return saved.getPostId();
        }

        @Transactional
        public Long updateCircleAsOwner(Long circleId, Long boardId, Long postId, Long userId, PostRequestDTO req) {
                validatePostText(req);

                circlePermissionService.requireActiveMember(circleId, userId);
                Post post = postRepository.findCirclePost(circleId, boardId, postId)
                                .orElseThrow(() -> new PostNotFoundException("[#POST] 게시글을 찾을 수 없습니다."));

                if (!circlePermissionService.canEditOwnContent(post.getUserId().getUserId(), userId)) {
                        throw new PostForbiddenException("[#POST] 작성자만 수정할 수 있습니다.");
                }

                post.changeTitle(req.getTitle());
                post.changeContent(req.getContent());
                if (req.getActivityPublic() != null) {
                        post.changeActivityPublic(resolveActivityPublic(post.getBoardId(), req.getActivityPublic()));
                }
                syncPostImages(post, post.getUserId(), req.getContent());
                postSearchService.queueUpsertAfterCommit(post.getPostId());
                return post.getPostId();
        }

        @Transactional
        public Long updateCircleActivityVisibility(
                        Long circleId,
                        Long boardId,
                        Long postId,
                        Long userId,
                        Boolean activityPublic) {
                circlePermissionService.requireActiveMember(circleId, userId);
                Post post = postRepository.findCirclePost(circleId, boardId, postId)
                                .orElseThrow(() -> new PostNotFoundException("[#POST] 게시글을 찾을 수 없습니다."));

                if (post.getBoardId().getCircleBoardKind() != com.soldesk.moa.board.entity.constant.CircleBoardKind.ACTIVITY) {
                        throw new InvalidRequestException("[#POST] 모임활동 게시글만 공개/비공개를 설정할 수 있습니다.");
                }

                boolean owner = circlePermissionService.canEditOwnContent(post.getUserId().getUserId(), userId);
                if (!owner) {
                        circlePermissionService.requireLeader(circleId, userId);
                }

                post.changeActivityPublic(activityPublic);
                postSearchService.queueUpsertAfterCommit(post.getPostId());
                return post.getPostId();
        }

        @Transactional
        public void deleteCircleAsOwner(Long circleId, Long boardId, Long postId, AuthUserDTO auth) {
                circlePermissionService.requireActiveMember(circleId, auth.getUserId());
                Post post = postRepository.findCirclePost(circleId, boardId, postId)
                                .orElseThrow(() -> new PostNotFoundException("[#POST] 게시글을 찾을 수 없습니다."));

                boolean owner = circlePermissionService.canEditOwnContent(post.getUserId().getUserId(),
                                auth.getUserId());
                if (!owner) {
                        circlePermissionService.requireLeader(circleId, auth.getUserId());
                }

                deletePostWithReplies(post);
                postSearchService.queueDeleteAfterCommit(post.getPostId());
        }

        // IP 기준 조회수 증가
        @Transactional
        public void increaseViewCountOnce(Long postId, String viewerIp) {
                if (viewerIp == null || viewerIp.isBlank()) {
                        return;
                }

                int inserted = postViewLogRepository.insertIgnore(postId, viewerIp);
                if (inserted > 0) {
                        postRepository.incrementViewCount(postId);
                }
        }

        @Transactional
        public PostReactionSummaryDTO reactToPost(Long postId, Long userId) {
                Post post = requireActivePost(postId);
                requireReactionPermission(post, userId);
                Users user = usersRepository.findById(userId)
                                .orElseThrow(() -> new PostNotFoundException("[#POST] 사용자를 찾을 수 없습니다."));

                PostReaction existing = postReactionRepository.findByPost_PostIdAndUser_UserId(postId, userId)
                                .orElse(null);

                String myReaction = "LIKE";
                if (existing == null) {
                        postReactionRepository.save(PostReaction.builder()
                                        .post(post)
                                        .user(user)
                                        .reactionType(PostReactionType.LIKE)
                                        .build());
                        postRepository.incrementLikeCount(postId);
                        Long authorId = post.getUserId().getUserId();
                        if (!authorId.equals(userId)) {
                                notificationService.sendAsync(
                                        authorId,
                                        NotificationType.POST_LIKE,
                                        user.getNickname() + "님이 회원님의 게시글을 좋아합니다.",
                                        postId
                                );
                        }
                } else if (existing.getReactionType() == PostReactionType.LIKE) {
                        postReactionRepository.delete(existing);
                        postRepository.decrementLikeCount(postId);
                        myReaction = null;
                } else {
                        throw new InvalidRequestException("[#POST] 지원하지 않는 반응 타입입니다.");
                }

                return buildReactionSummary(postId, myReaction);
        }

        @Transactional
        public PostBookmarkSummaryDTO toggleBookmark(Long postId, Long userId) {
                Post post = requireActivePost(postId);
                requireReactionPermission(post, userId);
                Users user = usersRepository.findById(userId)
                                .orElseThrow(() -> new PostNotFoundException("[#POST] 사용자를 찾을 수 없습니다."));

                PostBookmark existing = postBookmarkRepository.findByPost_PostIdAndUser_UserId(postId, userId)
                                .orElse(null);

                boolean bookmarked;
                if (existing == null) {
                        postBookmarkRepository.save(PostBookmark.builder()
                                        .post(post)
                                        .user(user)
                                        .build());
                        bookmarked = true;
                } else {
                        postBookmarkRepository.delete(existing);
                        bookmarked = false;
                }

                return PostBookmarkSummaryDTO.builder()
                                .bookmarked(bookmarked)
                                .build();
        }

        public PostBookmarkSummaryDTO getBookmarkSummary(Long postId, Long userId) {
                Post post = requireActivePost(postId);
                requireReactionPermission(post, userId);
                boolean bookmarked = postBookmarkRepository.findByPost_PostIdAndUser_UserId(postId, userId)
                                .isPresent();
                return PostBookmarkSummaryDTO.builder()
                                .bookmarked(bookmarked)
                                .build();
        }

        public List<PostResponseDTO> listMyBookmarkedCommunity(
                        Long userId,
                        BoardType boardType,
                        Long globalBoardId,
                        String keyword,
                        PostSearchTarget target) {
                BoardType normalizedBoardType = normalizeSidebarBoardType(boardType);
                List<PostResponseDTO> list = postBookmarkRepository.findBookmarkedPostsByUserId(userId, normalizedBoardType)
                                .stream()
                                .filter(post -> globalBoardId == null
                                                || Objects.equals(post.getBoardId().getBoardId(), globalBoardId))
                                .map(post -> toPostResponse(post, userId))
                                .toList();
                return filterPostResponsesByKeyword(sortWithPinnedPriority(list), keyword, target);
        }

        public List<PostResponseDTO> listMyBookmarkedCommunity(
                        Long userId,
                        BoardType boardType,
                        String keyword,
                        PostSearchTarget target) {
                return listMyBookmarkedCommunity(userId, boardType, null, keyword, target);
        }

        public List<PostResponseDTO> listMyCommunityPosts(
                        Long userId,
                        BoardType boardType,
                        Long globalBoardId,
                        String keyword,
                        PostSearchTarget target) {
                BoardType normalizedBoardType = normalizeSidebarBoardType(boardType);
                List<PostResponseDTO> list = postRepository.findMyCommunityPosts(userId, normalizedBoardType, globalBoardId)
                                .stream()
                                .map(post -> toPostResponse(post, userId))
                                .toList();
                return filterPostResponsesByKeyword(sortWithPinnedPriority(list), keyword, target);
        }

        public List<PostResponseDTO> listMyCommunityPosts(
                        Long userId,
                        BoardType boardType,
                        String keyword,
                        PostSearchTarget target) {
                return listMyCommunityPosts(userId, boardType, null, keyword, target);
        }

        public List<CommunityMyReplyDTO> listMyCommunityReplies(
                        Long userId,
                        BoardType boardType,
                        Long globalBoardId,
                        String keyword,
                        PostSearchTarget target) {
                BoardType normalizedBoardType = normalizeSidebarBoardType(boardType);
                List<CommunityMyReplyDTO> list = replyRepository.findMyCommunityReplies(userId, normalizedBoardType)
                                .stream()
                                .filter(reply -> globalBoardId == null
                                                || Objects.equals(reply.getPostId().getBoardId().getBoardId(), globalBoardId))
                                .map(reply -> CommunityMyReplyDTO.builder()
                                                .replyId(reply.getReplyId())
                                                .content(reply.getContent())
                                                .likeCount(reply.getLikeCount())
                                                .createDate(reply.getCreateDate())
                                                .postId(reply.getPostId().getPostId())
                                                .postTitle(reply.getPostId().getTitle())
                                                .boardId(reply.getPostId().getBoardId().getBoardId())
                                                .circleId(reply.getPostId().getBoardId().getCircleId() != null
                                                                ? reply.getPostId().getBoardId().getCircleId().getCircleId()
                                                                : null)
                                                .boardName(reply.getPostId().getBoardId().getName())
                                                .boardType(reply.getPostId().getBoardId().getBoardType())
                                                .build())
                                .toList();
                return filterMyRepliesByKeyword(list, keyword, target);
        }

        public List<CommunityMyReplyDTO> listMyCommunityReplies(
                        Long userId,
                        BoardType boardType,
                        String keyword,
                        PostSearchTarget target) {
                return listMyCommunityReplies(userId, boardType, null, keyword, target);
        }

        public List<PostResponseDTO> listMyBookmarkedCircle(
                        Long userId,
                        Long circleId,
                        Long boardId,
                        String keyword,
                        PostSearchTarget target,
                        CircleBoardKind circleBoardKind) {
                circlePermissionService.requireActiveMember(circleId, userId);
                List<PostResponseDTO> list = postBookmarkRepository.findBookmarkedCirclePostsByUserId(userId, circleId, boardId)
                                .stream()
                                .filter(post -> includeInCircleBoardLists(post.getBoardId(), boardId, circleBoardKind))
                                .map(post -> toPostResponse(post, userId))
                                .toList();
                return filterPostResponsesByKeyword(sortWithPinnedPriority(list), keyword, target);
        }

        public List<PostResponseDTO> listMyCirclePosts(
                        Long userId,
                        Long circleId,
                        Long boardId,
                        String keyword,
                        PostSearchTarget target,
                        CircleBoardKind circleBoardKind) {
                circlePermissionService.requireActiveMember(circleId, userId);
                List<PostResponseDTO> list = postRepository.findMyCirclePosts(userId, circleId, boardId)
                                .stream()
                                .filter(post -> includeInCircleBoardLists(post.getBoardId(), boardId, circleBoardKind))
                                .map(post -> toPostResponse(post, userId))
                                .toList();
                return filterPostResponsesByKeyword(sortWithPinnedPriority(list), keyword, target);
        }

        public List<CommunityMyReplyDTO> listMyCircleReplies(
                        Long userId,
                        Long circleId,
                        Long boardId,
                        String keyword,
                        PostSearchTarget target,
                        CircleBoardKind circleBoardKind) {
                circlePermissionService.requireActiveMember(circleId, userId);
                List<CommunityMyReplyDTO> list = replyRepository.findMyCircleReplies(userId, circleId, boardId)
                                .stream()
                                .filter(reply -> includeInCircleBoardLists(reply.getPostId().getBoardId(), boardId, circleBoardKind))
                                .map(reply -> CommunityMyReplyDTO.builder()
                                                .replyId(reply.getReplyId())
                                                .content(reply.getContent())
                                                .likeCount(reply.getLikeCount())
                                                .createDate(reply.getCreateDate())
                                                .postId(reply.getPostId().getPostId())
                                                .postTitle(reply.getPostId().getTitle())
                                                .boardId(reply.getPostId().getBoardId().getBoardId())
                                                .circleId(reply.getPostId().getBoardId().getCircleId() != null
                                                                ? reply.getPostId().getBoardId().getCircleId().getCircleId()
                                                                : null)
                                                .boardName(reply.getPostId().getBoardId().getName())
                                                .boardType(reply.getPostId().getBoardId().getBoardType())
                                                .build())
                                .toList();
                return filterMyRepliesByKeyword(list, keyword, target);
        }

        @Transactional
        public boolean toggleNoticePin(Long postId) {
                Post post = postRepository.findGlobalPost(BoardType.NOTICE, postId)
                                .orElseThrow(() -> new PostNotFoundException("[#POST] 게시글을 찾을 수 없습니다."));

                if (!post.isPinned()) {
                        long pinnedCount = postRepository.countPinnedNoticePosts();
                        if (pinnedCount >= MAX_PINNED_NOTICE_COUNT) {
                                throw new InvalidRequestException(
                                                "[#POST] 공지 상단 고정은 최대 " + MAX_PINNED_NOTICE_COUNT + "개까지 가능합니다.");
                        }
                }

                post.changePinned(!post.isPinned());
                return post.isPinned();
        }

        @Transactional
        public boolean toggleGlobalBoardPin(Long boardId, Long postId) {
                Board board = getGlobalBoardOrThrow(boardId);
                if (board.getBoardType() != BoardType.NOTICE) {
                        throw new InvalidRequestException("[#POST] 공지 게시판에서만 상단 고정이 가능합니다.");
                }

                Post post = postRepository.findGlobalPostByBoardId(boardId, postId)
                                .orElseThrow(() -> new PostNotFoundException("[#POST] 게시글을 찾을 수 없습니다."));

                if (!post.isPinned()) {
                        long pinnedCount = postRepository.countPinnedNoticePosts();
                        if (pinnedCount >= MAX_PINNED_NOTICE_COUNT) {
                                throw new InvalidRequestException(
                                                "[#POST] 공지 상단 고정은 최대 " + MAX_PINNED_NOTICE_COUNT + "개까지 가능합니다.");
                        }
                }
                post.changePinned(!post.isPinned());
                return post.isPinned();
        }

        // ===== helpers =====
        // 작성자 확인
        private boolean isOwner(Post post, Long userId) {

                return Objects.equals(post.getUserId().getUserId(), userId);
        }

        // 로그인 ADMIN확인
        private boolean isAdmin(AuthUserDTO auth) {

                return auth.getAuthorities().stream()
                                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
        }

        private void deletePostWithReplies(Post post) {
                replyRepository.softDeleteByPostId(post.getPostId());
                imageRepository.softDeleteByOwner(POST_IMAGE_DOMAIN, post.getPostId());
                post.changeImage(null);
                post.markDeleted();
        }

        private void syncPostImages(Post post, Users user, String content) {
                imageRepository.softDeleteByOwner(POST_IMAGE_DOMAIN, post.getPostId());

                List<String> imagePaths = extractPostImagePaths(content);
                if (imagePaths.isEmpty()) {
                        post.changeImage(null);
                        return;
                }

                Set<String> tempMatchedPaths = new HashSet<>(imageRepository.findPathsByUserAndStatusAndPathIn(
                                user.getUserId(),
                                ImageStatus.TEMP,
                                imagePaths));

                if (!tempMatchedPaths.isEmpty()) {
                        imageRepository.updateStatusAndOwnerByUserAndPaths(
                                        user.getUserId(),
                                        new ArrayList<>(tempMatchedPaths),
                                        ImageStatus.TEMP,
                                        ImageStatus.USED,
                                        POST_IMAGE_DOMAIN,
                                        post.getPostId());
                }

                List<Image> images = new ArrayList<>();
                for (int i = 0; i < imagePaths.size(); i++) {
                        String path = imagePaths.get(i);
                        if (tempMatchedPaths.contains(path)) {
                                continue;
                        }
                        images.add(Image.builder()
                                        .name(extractFileName(path))
                                        .uuid(UUID.randomUUID().toString())
                                        .path(path)
                                        .domain(POST_IMAGE_DOMAIN)
                                        .ownerId(post.getPostId())
                                        .uploadedByUserId(user.getUserId())
                                        .ord((long) (i + 1))
                                        .status(ImageStatus.USED)
                                        .build());
                }

                if (!images.isEmpty()) {
                        imageRepository.saveAll(images);
                }

                syncPostPrimaryImage(post, imagePaths.get(0));
        }

        private List<String> extractPostImagePaths(String content) {
                if (content == null || content.isBlank()) {
                        return List.of();
                }

                Matcher matcher = IMG_SRC_PATTERN.matcher(content);
                LinkedHashSet<String> orderedUniquePaths = new LinkedHashSet<>();
                while (matcher.find()) {
                        String src = matcher.group(1);
                        String normalized = normalizeToPostUploadPath(src);
                        if (normalized != null) {
                                orderedUniquePaths.add(normalized);
                        }
                }

                return new ArrayList<>(orderedUniquePaths);
        }

        private String normalizeToPostUploadPath(String src) {
                if (src == null || src.isBlank()) {
                        return null;
                }

                String trimmed = src.trim();
                if (trimmed.startsWith("/uploads/post/")) {
                        return trimmed;
                }
                if (trimmed.startsWith("/uploads/images/post/")) {
                        return trimmed;
                }

                int idx = trimmed.indexOf("/uploads/post/");
                if (idx >= 0) {
                        return trimmed.substring(idx);
                }

                idx = trimmed.indexOf("/uploads/images/post/");
                if (idx >= 0) {
                        return trimmed.substring(idx);
                }

                return null;
        }

        private String extractFileName(String path) {
                if (path == null || path.isBlank()) {
                        return "uploaded-file";
                }

                int slashIndex = path.lastIndexOf('/');
                if (slashIndex < 0 || slashIndex == path.length() - 1) {
                        return "uploaded-file";
                }

                return path.substring(slashIndex + 1);
        }

        private String toThumbnailPath(String path, String originalName) {
                if (path == null || path.isBlank()) {
                        return path;
                }

                String normalized = path;
                int slashIdx = normalized.lastIndexOf('/');
                if (slashIdx < 0) {
                        return normalized;
                }

                String directory = normalized.substring(0, slashIdx);
                String filename = normalized.substring(slashIdx + 1);
                String baseName = extractThumbnailBaseName(filename);

                if (!directory.endsWith("/thumbnails")) {
                        directory = directory + "/thumbnails";
                }
                return directory + "/" + baseName + "_thm.webp";
        }

        private String extractThumbnailBaseName(String fileName) {
                if (fileName == null || fileName.isBlank()) {
                        return "image";
                }

                String target = fileName;
                if (target.endsWith("_thm.webp")) {
                        return target.substring(0, target.length() - "_thm.webp".length());
                }

                int dotIdx = target.lastIndexOf('.');
                return dotIdx > 0 ? target.substring(0, dotIdx) : target;
        }

        private void validatePostText(PostRequestDTO req) {
                String normalizedTitle = req.getTitle() == null ? "" : req.getTitle().trim();
                if (normalizedTitle.length() < 2 || normalizedTitle.length() > 80) {
                        throw new InvalidRequestException("[#POST] 제목은 2자 이상 80자 이하여야 합니다.");
                }
                String normalizedContent = stripHtmlToText(req.getContent());
                boolean hasImage = !extractPostImageUrls(req.getContent()).isEmpty();
                if (normalizedContent.isBlank() && !hasImage) {
                        throw new InvalidRequestException("[#POST] 내용 또는 이미지를 입력해주세요.");
                }
                req.setTitle(normalizedTitle);
                profanityFilterService.validateNoProfanity(
                                req.getTitle(),
                                "[#POST] 제목에 사용할 수 없는 표현이 포함되어 있습니다.");
                profanityFilterService.validateNoProfanityInHtml(
                                req.getContent(),
                                "[#POST] 내용에 사용할 수 없는 표현이 포함되어 있습니다.");
        }

        private String stripHtmlToText(String html) {
                if (html == null || html.isBlank()) {
                        return "";
                }
                String noTag = HTML_TAG_PATTERN.matcher(html).replaceAll(" ");
                String noNbsp = HTML_NBSP_PATTERN.matcher(noTag).replaceAll(" ");
                return WHITESPACE_PATTERN.matcher(noNbsp).replaceAll(" ").trim();
        }

        private List<String> extractPostImageUrls(String html) {
                if (html == null || html.isBlank()) {
                        return List.of();
                }

                Matcher matcher = IMG_SRC_PATTERN.matcher(html);
                List<String> urls = new ArrayList<>();
                while (matcher.find()) {
                        String src = matcher.group(1);
                        if (src != null && !src.isBlank()) {
                                urls.add(src.trim());
                        }
                }
                return urls;
        }

        private PostResponseDTO toPostResponse(Post p, Long viewerUserId) {
                long replyCount = replyRepository.countByPostId_PostIdAndDeletedFalse(p.getPostId());
                String myReaction = resolveMyReaction(p.getPostId(), viewerUserId);

                return PostResponseDTO.builder()
                                .boardId(p.getBoardId().getBoardId())
                                .boardType(p.getBoardId().getBoardType())
                                .postId(p.getPostId())
                                .title(p.getTitle())
                                .content(p.getContent())
                                .imagePaths(extractPostImagePaths(p.getContent()))
                                .thumbnailImageId(p.getImage() != null ? p.getImage().getImageId() : null)
                                .thumbnailUrl(p.getImage() != null
                                                ? toThumbnailPath(p.getImage().getPath(), p.getImage().getName())
                                                : null)
                                .authorName(p.getUserId().getNickname())
                                .authorPublicId(p.getUserId().getPublicId())
                                .circleId(p.getBoardId().getCircleId() != null ? p.getBoardId().getCircleId().getCircleId() : null)
                                .circleName(p.getBoardId().getCircleId() != null ? p.getBoardId().getCircleId().getName() : null)
                                .activityPublic(p.isPublicCircleActivityPost())
                                .viewCount(p.getViewCount())
                                .likeCount(p.getLikeCount())
                                .myReaction(myReaction)
                                .replyCount(replyCount)
                                .noticeCategory(resolveNoticeCategory(p))
                                .pinned(p.isPinned())
                                .pinnedAt(p.getPinnedAt())
                                .createDate(p.getCreateDate())
                                .updateDate(p.getUpdateDate())
                                .build();
        }

        private PostResponseDTO toPostResponseWithCount(Object[] row) {
                Post p = (Post) row[0];
                long replyCount = (long) row[1];

                return PostResponseDTO.builder()
                                .boardId(p.getBoardId().getBoardId())
                                .boardType(p.getBoardId().getBoardType())
                                .postId(p.getPostId())
                                .title(p.getTitle())
                                .content(p.getContent())
                                .imagePaths(extractPostImagePaths(p.getContent()))
                                .thumbnailImageId(p.getImage() != null ? p.getImage().getImageId() : null)
                                .thumbnailUrl(p.getImage() != null
                                                ? toThumbnailPath(p.getImage().getPath(), p.getImage().getName())
                                                : null)
                                .authorName(p.getUserId().getNickname())
                                .authorPublicId(p.getUserId().getPublicId())
                                .circleId(p.getBoardId().getCircleId() != null ? p.getBoardId().getCircleId().getCircleId() : null)
                                .circleName(p.getBoardId().getCircleId() != null ? p.getBoardId().getCircleId().getName() : null)
                                .activityPublic(p.isPublicCircleActivityPost())
                                .viewCount(p.getViewCount())
                                .likeCount(p.getLikeCount())
                                .noticeCategory(resolveNoticeCategory(p))
                                .pinned(p.isPinned())
                                .pinnedAt(p.getPinnedAt())
                                .createDate(p.getCreateDate())
                                .updateDate(p.getUpdateDate())
                                .replyCount(replyCount)
                                .build();
        }

        private Board getGlobalBoardOrThrow(Long boardId) {
                Board board = boardRepository.findByBoardIdAndCircleIdIsNullAndDeletedFalse(boardId)
                                .orElseThrow(() -> new PostNotFoundException("[#POST] 글로벌 게시판을 찾을 수 없습니다."));
                if (board.getBoardType() == BoardType.CIRCLE) {
                        throw new InvalidRequestException("[#POST] 글로벌 게시판이 아닙니다.");
                }
                return board;
        }

        private NoticeCategory resolveNoticeCategory(BoardType boardType, NoticeCategory noticeCategory) {
                if (boardType != BoardType.NOTICE) {
                        return null;
                }
                return noticeCategory != null ? noticeCategory : NoticeCategory.ANNOUNCEMENT;
        }

        private NoticeCategory resolveNoticeCategory(Post post) {
                if (post.getBoardId().getBoardType() != BoardType.NOTICE) {
                        return null;
                }
                return post.getNoticeCategory() != null ? post.getNoticeCategory() : NoticeCategory.ANNOUNCEMENT;
        }

        private boolean resolveActivityPublic(Board board, Boolean requested) {
                if (board.getBoardType() != BoardType.CIRCLE) {
                        return false;
                }
                if (board.getCircleBoardKind() != com.soldesk.moa.board.entity.constant.CircleBoardKind.ACTIVITY) {
                        return false;
                }
                if (requested == null) {
                        return true;
                }
                return Boolean.TRUE.equals(requested);
        }

        private Post requireActivePost(Long postId) {
                return postRepository.findByPostIdAndDeletedFalseAndBoardId_DeletedFalse(postId)
                                .orElseThrow(() -> new PostNotFoundException("[#POST] 게시글을 찾을 수 없습니다."));
        }

        private void requireReactionPermission(Post post, Long userId) {
                if (post.getBoardId().getBoardType() != BoardType.CIRCLE || post.getBoardId().getCircleId() == null) {
                        return;
                }
                circlePermissionService.requireActiveMember(post.getBoardId().getCircleId().getCircleId(), userId);
        }

        private String resolveMyReaction(Long postId, Long viewerUserId) {
                if (viewerUserId == null) {
                        return null;
                }

                return postReactionRepository.findByPost_PostIdAndUser_UserId(postId, viewerUserId)
                                .map(reaction -> reaction.getReactionType().name())
                                .orElse(null);
        }

        private PostReactionSummaryDTO buildReactionSummary(Long postId, String myReaction) {
                Post refreshed = requireActivePost(postId);
                return PostReactionSummaryDTO.builder()
                                .likeCount(refreshed.getLikeCount())
                                .myReaction(myReaction)
                                .build();
        }

        private void syncPostPrimaryImage(Post post, String primaryPath) {
                if (primaryPath == null || primaryPath.isBlank()) {
                        post.changeImage(null);
                        return;
                }
                Image primary = imageRepository
                                .findFirstByDomainAndOwnerIdAndPathAndDeletedFalseAndStatus(
                                                POST_IMAGE_DOMAIN,
                                                post.getPostId(),
                                                primaryPath,
                                                ImageStatus.USED)
                                .orElse(null);
                post.changeImage(primary);
        }

        private CommunitySidebarPostDTO toCommunitySidebarPost(Object[] row) {
                Post post = (Post) row[0];
                long replyCount = ((Number) row[1]).longValue();
                return CommunitySidebarPostDTO.builder()
                                .postId(post.getPostId())
                                .boardId(post.getBoardId().getBoardId())
                                .boardName(post.getBoardId().getName())
                                .boardType(post.getBoardId().getBoardType())
                                .title(post.getTitle())
                                .viewCount(post.getViewCount())
                                .replyCount(replyCount)
                                .createDate(post.getCreateDate())
                                .build();
        }

        private int safeSidebarLimit(Integer limit) {
                if (limit == null || limit < 1) {
                        return 12;
                }
                return Math.min(limit, 50);
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

        private boolean includeInCircleBoardLists(Board board, Long requestedBoardId, CircleBoardKind requestedKind) {
                if (requestedBoardId != null) {
                        return true;
                }
                return includeInCircleBoardLists(isActivityCircleBoard(board), requestedKind);
        }

        private boolean includeInCircleBoardLists(boolean isActivity, CircleBoardKind requestedKind) {
                if (requestedKind == CircleBoardKind.ACTIVITY) {
                        return isActivity;
                }
                return !isActivity;
        }

        private boolean isActivityCirclePost(Object postCandidate) {
                if (!(postCandidate instanceof Post post)) {
                        return false;
                }
                return isActivityCircleBoard(post.getBoardId());
        }

        private boolean isActivityCircleBoard(Board board) {
                if (board == null || board.getBoardType() != BoardType.CIRCLE) {
                        return false;
                }
                return board.getCircleBoardKind() == CircleBoardKind.ACTIVITY;
        }

        private String normalizeSidebarSort(String sort) {
                if (sort == null || sort.isBlank()) {
                        return "recent";
                }
                String normalized = sort.trim().toLowerCase();
                if ("views".equals(normalized) || "replies".equals(normalized) || "recent".equals(normalized)) {
                        return normalized;
                }
                return "recent";
        }

        private BoardType normalizeSidebarBoardType(BoardType boardType) {
                if (boardType == BoardType.FREE || boardType == BoardType.NOTICE) {
                        return boardType;
                }
                return null;
        }

        private List<PostResponseDTO> sortWithPinnedPriority(List<PostResponseDTO> source) {
                return source.stream()
                                .sorted(Comparator
                                                .comparing(PostResponseDTO::isPinned).reversed()
                                                .thenComparing(PostResponseDTO::getPinnedAt,
                                                                Comparator.nullsLast(Comparator.reverseOrder()))
                                                .thenComparing(PostResponseDTO::getCreateDate,
                                                                Comparator.nullsLast(Comparator.reverseOrder())))
                                .toList();
        }

        private List<PostResponseDTO> filterPostResponsesByKeyword(
                        List<PostResponseDTO> source,
                        String keyword,
                        PostSearchTarget target) {
                String normalized = normalizeKeyword(keyword);
                if (normalized.isEmpty()) {
                        return source;
                }
                PostSearchTarget safeTarget = target == null ? PostSearchTarget.ALL : target;
                return source.stream()
                                .filter(post -> matchesPostKeyword(post, normalized, safeTarget))
                                .toList();
        }

        private List<CommunityMyReplyDTO> filterMyRepliesByKeyword(
                        List<CommunityMyReplyDTO> source,
                        String keyword,
                        PostSearchTarget target) {
                String normalized = normalizeKeyword(keyword);
                if (normalized.isEmpty()) {
                        return source;
                }
                PostSearchTarget safeTarget = target == null ? PostSearchTarget.ALL : target;
                return source.stream()
                                .filter(reply -> matchesReplyKeyword(reply, normalized, safeTarget))
                                .toList();
        }

        private boolean matchesPostKeyword(PostResponseDTO post, String keyword, PostSearchTarget target) {
                String title = safeLower(post.getTitle());
                String content = safeLower(post.getContent());
                return switch (target) {
                        case TITLE -> containsWithChoseong(title, keyword);
                        case CONTENT -> containsWithChoseong(content, keyword);
                        case ALL -> containsWithChoseong(title, keyword) || containsWithChoseong(content, keyword);
                };
        }

        private boolean matchesReplyKeyword(CommunityMyReplyDTO reply, String keyword, PostSearchTarget target) {
                String title = safeLower(reply.getPostTitle());
                String content = safeLower(reply.getContent());
                return switch (target) {
                        case TITLE -> containsWithChoseong(title, keyword);
                        case CONTENT -> containsWithChoseong(content, keyword);
                        case ALL -> containsWithChoseong(title, keyword) || containsWithChoseong(content, keyword);
                };
        }

        private String normalizeKeyword(String keyword) {
                if (keyword == null) {
                        return "";
                }
                return keyword.trim().toLowerCase();
        }

        private String safeLower(String value) {
                return value == null ? "" : value.toLowerCase();
        }

        private boolean containsWithChoseong(String source, String keyword) {
                if (source.contains(keyword)) {
                        return true;
                }
                return HangulChosungTextUtils.includesByCho(source, keyword);
        }

}

