package com.soldesk.moa.post.service;

import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.ArrayList;
import java.util.LinkedHashSet;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.soldesk.moa.board.entity.Board;
import com.soldesk.moa.board.entity.constant.BoardType;
import com.soldesk.moa.board.repository.BoardRepository;
import com.soldesk.moa.board.service.CirclePermissionService;
import com.soldesk.moa.common.entity.Image;
import com.soldesk.moa.common.repository.ImageRepository;
import com.soldesk.moa.post.dto.PostRequestDTO;
import com.soldesk.moa.post.dto.PostResponseDTO;
import com.soldesk.moa.post.entity.Post;
import com.soldesk.moa.post.exception.PostForbiddenException;
import com.soldesk.moa.post.exception.PostNotFoundException;
import com.soldesk.moa.post.repository.PostRepository;
import com.soldesk.moa.reply.repository.ReplyRepository;
import com.soldesk.moa.auth.dto.AuthUserDTO;
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

        private static final Pattern IMG_SRC_PATTERN = Pattern.compile("<img[^>]*\\bsrc\\s*=\\s*['\\\"]([^'\\\"]+)['\\\"][^>]*>",
                        Pattern.CASE_INSENSITIVE);

        private final PostRepository postRepository;
        private final ReplyRepository replyRepository;
        private final BoardRepository boardRepository;
        private final UsersRepository usersRepository;
        private final CirclePermissionService circlePermissionService;
        private final ImageRepository imageRepository;

        // ===== Global =====

        // // 글로벌 게시판 리스트
        // public List<PostResponseDTO> listGlobal(BoardType type) {
        // return postRepository.findGlobalPosts(type).stream()
        // .map(this::toPostResponse)
        // .toList();
        // }

        // 글로벌 게시판 리스트(댓글 포함)
        public List<PostResponseDTO> listGlobal(BoardType type) {
                return postRepository.findGlobalPostsWithReplyCount(type).stream()
                                .map(this::toPostResponseWithCount)
                                .toList();
        }

        public PostResponseDTO readGlobal(BoardType type, Long postId) {
                Post post = postRepository.findGlobalPost(type, postId)
                                .orElseThrow(() -> new PostNotFoundException("[#POST] 게시글을 찾을 수 없습니다."));
                return toPostResponse(post);
        }

        @Transactional
        public Long createGlobal(BoardType type, AuthUserDTO auth, PostRequestDTO req) {
                Board board = boardRepository.findByBoardTypeAndCircleIdIsNullAndDeletedFalse(type)
                                .orElseThrow(() -> new PostNotFoundException("[#POST] 글로벌 게시판을 찾을 수 없습니다."));

                Users user = usersRepository.findById(auth.getUserId())
                                .orElseThrow(() -> new PostNotFoundException("[#POST] 사용자를 찾을 수 없습니다."));

                Post post = Post.builder()
                                .boardId(board)
                                .title(req.getTitle())
                                .content(req.getContent())
                                .userId(user)
                                .build();

                Post saved = postRepository.save(post);
                syncPostImages(saved, user, req.getContent());
                return saved.getPostId();
        }

        @Transactional
        public Long updateGlobal(BoardType type, Long postId, PostRequestDTO req) {
                Post post = postRepository.findGlobalPost(type, postId)
                                .orElseThrow(() -> new PostNotFoundException("[#POST] 게시글을 찾을 수 없습니다."));
                post.changeTitle(req.getTitle());
                post.changeContent(req.getContent());
                syncPostImages(post, post.getUserId(), req.getContent());
                return post.getPostId();
        }

        @Transactional
        public void deleteGlobal(BoardType type, Long postId) {
                Post post = postRepository.findGlobalPost(type, postId)
                                .orElseThrow(() -> new PostNotFoundException("[#POST] 게시글을 찾을 수 없습니다."));
                deletePostWithReplies(post);
        }

        // ===== FREE (작성자 검증) =====

        @Transactional
        public Long updateFreeAsOwner(Long postId, AuthUserDTO auth, PostRequestDTO req) {
                Post post = postRepository.findGlobalPost(BoardType.FREE, postId)
                                .orElseThrow(() -> new PostNotFoundException("[#POST] 게시글을 찾을 수 없습니다."));

                if (!isOwner(post, auth.getUserId())) {
                        throw new PostForbiddenException("[#POST] 작성자만 수정할 수 있습니다.");
                }

                post.changeTitle(req.getTitle());
                post.changeContent(req.getContent());
                syncPostImages(post, post.getUserId(), req.getContent());
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
                circlePermissionService.requireActiveMember(circleId, userId);
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
        public List<PostResponseDTO> listCircleAllBoardsPosts(Long circleId, Long userId) {
                circlePermissionService.requireActiveMember(circleId, userId);
                return postRepository.findCirclePostsAllBoardsWithReplyCount(circleId).stream()
                                .map(this::toPostResponseWithCount)
                                .toList();
        }

        public PostResponseDTO readCircle(Long circleId, Long boardId, Long postId, Long userId) {
                circlePermissionService.requireActiveMember(circleId, userId);
                Post post = postRepository.findCirclePost(circleId, boardId, postId)
                                .orElseThrow(() -> new PostNotFoundException("[#POST] 게시글을 찾을 수 없습니다."));
                return toPostResponse(post);
        }

        @Transactional
        public Long createCircle(Long circleId, Long boardId, Long userId, PostRequestDTO req) {
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
                                .build();

                Post saved = postRepository.save(post);
                syncPostImages(saved, user, req.getContent());
                return saved.getPostId();
        }

        @Transactional
        public Long updateCircleAsOwner(Long circleId, Long boardId, Long postId, Long userId, PostRequestDTO req) {
                circlePermissionService.requireActiveMember(circleId, userId);
                Post post = postRepository.findCirclePost(circleId, boardId, postId)
                                .orElseThrow(() -> new PostNotFoundException("[#POST] 게시글을 찾을 수 없습니다."));

                if (!circlePermissionService.canEditOwnContent(post.getUserId().getUserId(), userId)) {
                        throw new PostForbiddenException("[#POST] 작성자만 수정할 수 있습니다.");
                }

                post.changeTitle(req.getTitle());
                post.changeContent(req.getContent());
                syncPostImages(post, post.getUserId(), req.getContent());
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
                post.markDeleted();
        }

        private void syncPostImages(Post post, Users user, String content) {
                imageRepository.deleteByPost(post);

                List<String> imagePaths = extractPostImagePaths(content);
                if (imagePaths.isEmpty()) {
                        return;
                }

                List<Image> images = new ArrayList<>();
                for (int i = 0; i < imagePaths.size(); i++) {
                        String path = imagePaths.get(i);
                        images.add(Image.builder()
                                        .name(extractFileName(path))
                                        .uuid(UUID.randomUUID().toString())
                                        .path(path)
                                        .ord((long) (i + 1))
                                        .post(post)
                                        .user(user)
                                        .build());
                }

                imageRepository.saveAll(images);
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

                int idx = trimmed.indexOf("/uploads/post/");
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

        private PostResponseDTO toPostResponse(Post p) {

                return PostResponseDTO.builder()
                                .boardId(p.getBoardId().getBoardId())
                                .postId(p.getPostId())
                                .title(p.getTitle())
                                .content(p.getContent())
                                .authorName(p.getUserId().getName()) // Users PK명 맞춰 수정
                                .authorPublicId(p.getUserId().getPublicId())
                                .viewCount(p.getViewCount())
                                .createDate(p.getCreateDate())
                                .updateDate(p.getUpdateDate())
                                .build();
        }

        private PostResponseDTO toPostResponseWithCount(Object[] row) {
                Post p = (Post) row[0];
                long replyCount = (long) row[1];

                return PostResponseDTO.builder()
                                .boardId(p.getBoardId().getBoardId())
                                .postId(p.getPostId())
                                .title(p.getTitle())
                                .content(p.getContent())
                                .authorName(p.getUserId().getName())
                                .authorPublicId(p.getUserId().getPublicId())
                                .viewCount(p.getViewCount())
                                .createDate(p.getCreateDate())
                                .updateDate(p.getUpdateDate())
                                .replyCount(replyCount)
                                .build();
        }

}
