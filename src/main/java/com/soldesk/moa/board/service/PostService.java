package com.soldesk.moa.board.service;

import java.util.List;
import java.util.Objects;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.soldesk.moa.board.dto.PostRequestDTO;
import com.soldesk.moa.board.dto.PostResponseDTO;
import com.soldesk.moa.board.entity.Board;
import com.soldesk.moa.board.entity.Post;
import com.soldesk.moa.board.entity.constant.BoardType;
import com.soldesk.moa.board.repository.BoardRepository;
import com.soldesk.moa.board.repository.PostRepository;
import com.soldesk.moa.circle.repository.CircleMemberRepository;
import com.soldesk.moa.users.dto.AuthUserDTO;
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
        private final BoardRepository boardRepository;
        private final UsersRepository usersRepository;
        private final CircleMemberRepository circleMemberRepository; // 선택

        // ===== Global =====

        public List<PostResponseDTO> listGlobal(BoardType type) {
                return postRepository.findGlobalPosts(type).stream()
                                .map(this::toPostResponse)
                                .toList();
        }

        public PostResponseDTO readGlobal(BoardType type, Long postId) {
                Post post = postRepository.findGlobalPost(type, postId)
                                .orElseThrow(() -> new NotFoundException("post not found"));
                return toPostResponse(post);
        }

        @Transactional
        public Long createGlobal(BoardType type, AuthUserDTO auth, PostRequestDTO req) {
                Board board = boardRepository.findByBoardTypeAndCircleIdIsNull(type)
                                .orElseThrow(() -> new NotFoundException("global board not found"));

                Users user = usersRepository.findById(auth.getUserId())
                                .orElseThrow(() -> new NotFoundException("user not found"));

                Post post = Post.builder()
                                .boardId(board)
                                .title(req.getTitle())
                                .content(req.getContent())
                                .userId(user)
                                .build();

                return postRepository.save(post).getPostId();
        }

        @Transactional
        public Long updateGlobal(BoardType type, Long postId, PostRequestDTO req) {
                Post post = postRepository.findGlobalPost(type, postId)
                                .orElseThrow(() -> new NotFoundException("post not found"));
                post.changeTitle(req.getTitle());
                post.changeContent(req.getContent());
                return post.getPostId();
        }

        @Transactional
        public void deleteGlobal(BoardType type, Long postId) {
                Post post = postRepository.findGlobalPost(type, postId)
                                .orElseThrow(() -> new NotFoundException("post not found"));
                postRepository.delete(post);
        }

        // ===== FREE (작성자 검증) =====

        @Transactional
        public Long updateFreeAsOwner(Long postId, AuthUserDTO auth, PostRequestDTO req) {
                Post post = postRepository.findGlobalPost(BoardType.FREE, postId)
                                .orElseThrow(() -> new NotFoundException("post not found"));

                if (!isOwner(post, auth.getUserId()) && !isAdmin(auth)) {
                        throw new ForbiddenException("not owner");
                }

                post.changeTitle(req.getTitle());
                post.changeContent(req.getContent());
                return post.getPostId();
        }

        @Transactional
        public void deleteFreeAsOwner(Long postId, AuthUserDTO auth) {
                Post post = postRepository.findGlobalPost(BoardType.FREE, postId)
                                .orElseThrow(() -> new NotFoundException("post not found"));

                if (!isOwner(post, auth.getUserId()) && !isAdmin(auth)) {
                        throw new ForbiddenException("not owner");
                }

                postRepository.delete(post);
        }

        // ===== Circle =====

        public List<PostResponseDTO> listCircle(Long circleId, Long boardId) {
                return postRepository.findCirclePosts(circleId, boardId).stream()
                                .map(this::toPostResponse)
                                .toList();
        }

        public List<PostResponseDTO> listCircleAllBoardsPosts(Long circleId) {
                return postRepository.findCirclePostsAllBoards(circleId).stream()
                                .map(this::toPostResponse)
                                .toList();
        }

        public PostResponseDTO readCircle(Long circleId, Long boardId, Long postId) {
                Post post = postRepository.findCirclePost(circleId, boardId, postId)
                                .orElseThrow(() -> new NotFoundException("post not found"));
                return toPostResponse(post);
        }

        @Transactional
        public Long createCircle(Long circleId, Long boardId, Long userId, PostRequestDTO req) {
                // // 1) 써클멤버 체크 (써클멤버만 작성 가능)
                // if (!circleMemberRepository.existsByCircle_CircleIdAndUser_UserId(circleId,
                //
                // {
                // throw new ForbiddenException("not a circle member");
                // }

                // 2) board가 circle에 속한 CIRCLE board인지 검증
                Board board = boardRepository
                                .findByBoardIdAndBoardTypeAndCircleId_CircleId(boardId, BoardType.CIRCLE, circleId)
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

                return postRepository.save(post).getPostId();
        }

        @Transactional
        public Long updateCircleAsOwner(Long circleId, Long boardId, Long postId, Long userId, PostRequestDTO req) {
                Post post = postRepository.findCirclePost(circleId, boardId, postId)
                                .orElseThrow(() -> new NotFoundException("post not found"));

                if (!isOwner(post, userId)) {
                        throw new ForbiddenException("not owner");
                }

                post.changeTitle(req.getTitle());
                post.changeContent(req.getContent());
                return post.getPostId();
        }

        @Transactional
        public void deleteCircleAsOwner(Long circleId, Long boardId, Long postId, AuthUserDTO auth) {
                Post post = postRepository.findCirclePost(circleId, boardId, postId)
                                .orElseThrow(() -> new NotFoundException("post not found"));

                if (!isOwner(post, auth.getUserId()) && !isAdmin(auth)) {
                        throw new ForbiddenException("not owner");
                }

                postRepository.delete(post);
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

        private PostResponseDTO toPostResponse(Post p) {

                return PostResponseDTO.builder()
                                .boardId(p.getBoardId().getBoardId())
                                .postId(p.getPostId())
                                .title(p.getTitle())
                                .content(p.getContent())
                                .authorName(p.getUserId().getName()) // Users PK명 맞춰 수정
                                .viewCount(p.getViewCount())
                                .createDate(p.getCreateDate())
                                .updateDate(p.getUpdateDate())
                                .build();
        }
}