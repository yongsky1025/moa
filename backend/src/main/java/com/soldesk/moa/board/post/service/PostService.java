package com.soldesk.moa.board.post.service;

import java.util.List;
import java.time.LocalDateTime;
import java.util.Objects;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.soldesk.moa.auth.dto.AuthUserDTO;
import com.soldesk.moa.board.common.exception.ForbiddenException;
import com.soldesk.moa.board.common.exception.BadRequestException;
import com.soldesk.moa.board.common.exception.NotFoundException;
import com.soldesk.moa.board.post.dto.PostCardResponseDTO;
import com.soldesk.moa.board.post.dto.PostRequestDTO;
import com.soldesk.moa.board.post.dto.PostResponseDTO;
import com.soldesk.moa.board.post.dto.PostSearchPageRequestDTO;
import com.soldesk.moa.board.board.entity.Board;
import com.soldesk.moa.board.post.entity.Post;
import com.soldesk.moa.board.board.entity.constant.BoardType;
import com.soldesk.moa.board.board.repository.BoardRepository;
import com.soldesk.moa.board.post.repository.PostRepository;
import com.soldesk.moa.board.reply.repository.ReplyRepository;
import com.soldesk.moa.users.entity.Users;
import com.soldesk.moa.users.repository.UsersRepository;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Log4j2
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PostService {

        private final PostRepository postRepository;
        private final ReplyRepository replyRepository;
        private final BoardRepository boardRepository;
        private final UsersRepository usersRepository;
        private final PostImageService postImageService;

        // ===== Global =====
        public List<PostResponseDTO> listGlobal(BoardType type) {
                return findPostRows(type, null, null, null, Pageable.unpaged()).stream()
                                .map(this::toPostResponseWithCount)
                                .toList();
        }

        public List<PostCardResponseDTO> listGlobalCards(BoardType type) {
                return findPostRows(type, null, null, null, Pageable.unpaged()).stream()
                                .map(this::toPostCardResponseWithCount)
                                .toList();
        }

        public Page<PostResponseDTO> listGlobalPaged(BoardType type, PostSearchPageRequestDTO pageRequest) {
                PostSearchPageRequestDTO request = pageRequest != null ? pageRequest : new PostSearchPageRequestDTO();
                Page<Object[]> page = findPostRows(type, null, null, request.normalizedKeyword(),
                                request.toPageable());
                return page.map(this::toPostResponseWithCount);
        }

        public Page<PostCardResponseDTO> listGlobalCardsPaged(BoardType type, PostSearchPageRequestDTO pageRequest) {
                PostSearchPageRequestDTO request = pageRequest != null ? pageRequest : new PostSearchPageRequestDTO();
                Page<Object[]> page = findPostRows(type, null, null, request.normalizedKeyword(), request.toPageable());
                return page.map(this::toPostCardResponseWithCount);
        }

        public PostResponseDTO readGlobal(BoardType type, Long postId) {
                Post post = postRepository.findGlobalPost(type, postId)
                                .orElseThrow(() -> new NotFoundException("post not found"));
                return toPostResponse(post);
        }

        @Transactional
        public Long createGlobal(BoardType type, AuthUserDTO auth, PostRequestDTO req) {
                Board board = boardRepository.findByBoardTypeAndCircleIdIsNullAndDeletedFalse(type)
                                .orElseThrow(() -> new NotFoundException("global board not found"));

                Users user = usersRepository.findById(auth.getUserId())
                                .orElseThrow(() -> new NotFoundException("user not found"));

                Post post = Post.builder()
                                .boardId(board)
                                .title(req.getTitle())
                                .content(req.getContent())
                                .userId(user)
                                .build();

                Post saved = postRepository.save(post);
                postImageService.attachTempImagesAndResolveThumbnail(auth.getUserId(), saved, req);
                return saved.getPostId();
        }

        @Transactional
        public Long updateGlobal(BoardType type, Long postId, Long actorUserId, PostRequestDTO req) {
                Post post = postRepository.findGlobalPostIncludingDeleted(type, postId)
                                .orElseThrow(() -> new NotFoundException("post not found"));
                validatePostNotDeleted(post);
                post.changeTitle(req.getTitle());
                post.changeContent(req.getContent());
                postImageService.attachTempImagesAndResolveThumbnail(actorUserId, post, req);
                return post.getPostId();
        }

        @Transactional
        public void deleteGlobal(BoardType type, Long postId) {
                Post post = postRepository.findGlobalPostIncludingDeleted(type, postId)
                                .orElseThrow(() -> new NotFoundException("post not found"));
                softDeletePostWithReplies(post);
        }

        // ===== FREE (작성자 검증) =====

        @Transactional
        public Long updateFreeAsOwner(Long postId, AuthUserDTO auth, PostRequestDTO req) {
                Post post = postRepository.findGlobalPostIncludingDeleted(BoardType.FREE, postId)
                                .orElseThrow(() -> new NotFoundException("post not found"));
                validatePostNotDeleted(post);

                if (!isOwner(post, auth.getUserId()) && !isAdmin(auth)) {
                        throw new ForbiddenException("not owner");
                }

                post.changeTitle(req.getTitle());
                post.changeContent(req.getContent());
                postImageService.attachTempImagesAndResolveThumbnail(auth.getUserId(), post, req);
                return post.getPostId();
        }

        @Transactional
        public void deleteFreeAsOwner(Long postId, AuthUserDTO auth) {
                Post post = postRepository.findGlobalPostIncludingDeleted(BoardType.FREE, postId)
                                .orElseThrow(() -> new NotFoundException("post not found"));

                if (!isOwner(post, auth.getUserId()) && !isAdmin(auth)) {
                        throw new ForbiddenException("not owner");
                }

                softDeletePostWithReplies(post);
        }

        // ===== Circle =====

        public List<PostResponseDTO> listCircle(Long circleId, Long boardId) {
                return findPostRows(BoardType.CIRCLE, circleId, boardId, null, Pageable.unpaged()).stream()
                                .map(this::toPostResponseWithCount)
                                .toList();
        }

        public List<PostCardResponseDTO> listCircleCards(Long circleId, Long boardId) {
                return findPostRows(BoardType.CIRCLE, circleId, boardId, null, Pageable.unpaged()).stream()
                                .map(this::toPostCardResponseWithCount)
                                .toList();
        }

        public List<PostResponseDTO> listCircleAllBoardsPosts(Long circleId) {
                return findPostRows(BoardType.CIRCLE, circleId, null, null, Pageable.unpaged()).stream()
                                .map(this::toPostResponseWithCount)
                                .toList();
        }

        public Page<PostResponseDTO> listCirclePaged(Long circleId, Long boardId, PostSearchPageRequestDTO pageRequest) {
                PostSearchPageRequestDTO request = pageRequest != null ? pageRequest : new PostSearchPageRequestDTO();
                Page<Object[]> page = findPostRows(BoardType.CIRCLE, circleId, boardId, request.normalizedKeyword(),
                                request.toPageable());
                return page.map(this::toPostResponseWithCount);
        }

        public Page<PostCardResponseDTO> listCircleCardsPaged(Long circleId, Long boardId,
                        PostSearchPageRequestDTO pageRequest) {
                PostSearchPageRequestDTO request = pageRequest != null ? pageRequest : new PostSearchPageRequestDTO();
                Page<Object[]> page = findPostRows(BoardType.CIRCLE, circleId, boardId, request.normalizedKeyword(),
                                request.toPageable());
                return page.map(this::toPostCardResponseWithCount);
        }

        public PostResponseDTO readCircle(Long circleId, Long boardId, Long postId) {
                Post post = postRepository.findCirclePost(circleId, boardId, postId)
                                .orElseThrow(() -> new NotFoundException("post not found"));
                return toPostResponse(post);
        }

        @Transactional
        public Long createCircle(Long circleId, Long boardId, Long userId, PostRequestDTO req) {
                Board board = boardRepository
                                .findByBoardIdAndBoardTypeAndCircleId_CircleIdAndDeletedFalse(boardId, BoardType.CIRCLE,
                                                circleId)
                                .orElseThrow(() -> new ForbiddenException("board not in circle"));

                Users user = usersRepository.findById(userId)
                                .orElseThrow(() -> new NotFoundException("user not found"));

                Post post = Post
                                .builder()
                                .boardId(board)
                                .title(req.getTitle())
                                .content(req.getContent())
                                .userId(user)
                                .build();

                Post saved = postRepository.save(post);
                postImageService.attachTempImagesAndResolveThumbnail(userId, saved, req);
                return saved.getPostId();
        }

        @Transactional
        public Long updateCircleAsOwner(Long circleId, Long boardId, Long postId, Long userId, PostRequestDTO req) {
                Post post = postRepository.findCirclePostIncludingDeleted(circleId, boardId, postId)
                                .orElseThrow(() -> new NotFoundException("post not found"));
                validatePostNotDeleted(post);

                if (!isOwner(post, userId)) {
                        throw new ForbiddenException("not owner");
                }

                post.changeTitle(req.getTitle());
                post.changeContent(req.getContent());
                postImageService.attachTempImagesAndResolveThumbnail(userId, post, req);
                return post.getPostId();
        }

        @Transactional
        public void deleteCircleAsOwner(Long circleId, Long boardId, Long postId, AuthUserDTO auth) {
                Post post = postRepository.findCirclePostIncludingDeleted(circleId, boardId, postId)
                                .orElseThrow(() -> new NotFoundException("post not found"));

                if (!isOwner(post, auth.getUserId()) && !isAdmin(auth)) {
                        throw new ForbiddenException("not owner");
                }

                softDeletePostWithReplies(post);
        }

        public List<PostCardResponseDTO> listMyPostCards(Long userId) {
                return postRepository.findMyPostCards(userId);
        }

        // 세션 조회수 증가
        @Transactional
        public void increaseViewCountOnce(Long postId, HttpSession session) {
                String key = "viewed:post:" + postId;
                if (session.getAttribute(key) != null)
                        return;

                postRepository.incrementViewCount(postId);
                session.setAttribute(key, true);
        }

        // ===== helpers =====
        private boolean isOwner(Post post, Long userId) {
                return Objects.equals(post.getUserId().getUserId(), userId);
        }

        private boolean isAdmin(AuthUserDTO auth) {
                return auth.getAuthorities().stream()
                                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
        }

        private void validatePostNotDeleted(Post post) {
                if (post.isDeleted()) {
                        throw new BadRequestException("deleted post cannot be modified");
                }
                if (post.getBoardId().isDeleted()) {
                        throw new BadRequestException("post in deleted board cannot be modified");
                }
        }

        private void softDeletePostWithReplies(Post post) {
                if (post.isDeleted()) {
                        return;
                }
                LocalDateTime deletedAt = LocalDateTime.now();
                post.markDeleted(deletedAt);
                replyRepository.softDeleteByPostId(post.getPostId(), deletedAt);
        }

        private Page<Object[]> findPostRows(BoardType boardType, Long circleId, Long boardId, String keyword,
                        Pageable pageable) {
                return postRepository.searchPostsWithReplyCount(boardType, circleId, boardId, keyword, pageable);
        }

        private PostResponseDTO toPostResponse(Post p) {
                return PostResponseDTO.builder()
                                .boardId(p.getBoardId().getBoardId())
                                .postId(p.getPostId())
                                .title(p.getTitle())
                                .content(p.getContent())
                                .authorName(p.getUserId().getName())
                                .viewCount(p.getViewCount())
                                .thumbnailImagePath(postImageService.findThumbnailPath(p.getPostId()))
                                .createDate(p.getCreateDate())
                                .updateDate(p.getUpdateDate())
                                .build();
        }

        private PostResponseDTO toPostResponseWithCount(Object[] row) {
                Post p = (Post) row[0];
                long replyCount = ((Number) row[1]).longValue();

                return PostResponseDTO.builder()
                                .boardId(p.getBoardId().getBoardId())
                                .postId(p.getPostId())
                                .title(p.getTitle())
                                .content(p.getContent())
                                .authorName(p.getUserId().getName())
                                .viewCount(p.getViewCount())
                                .thumbnailImagePath(postImageService.findThumbnailPath(p.getPostId()))
                                .createDate(p.getCreateDate())
                                .updateDate(p.getUpdateDate())
                                .replyCount(replyCount)
                                .build();
        }

        private PostCardResponseDTO toPostCardResponseWithCount(Object[] row) {
                Post p = (Post) row[0];
                long replyCount = ((Number) row[1]).longValue();

                return new PostCardResponseDTO(
                                p.getPostId(),
                                p.getBoardId().getBoardId(),
                                p.getBoardId().getName(),
                                p.getTitle(),
                                p.getUserId().getName(),
                                postImageService.findThumbnailPath(p.getPostId()),
                                p.getCreateDate(),
                                p.getViewCount(),
                                replyCount);
        }
}
