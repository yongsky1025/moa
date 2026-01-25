package com.soldesk.moa.board.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.soldesk.moa.board.dto.PostDTO;
import com.soldesk.moa.board.entity.Board;
import com.soldesk.moa.board.entity.Post;
import com.soldesk.moa.board.repository.BoardRepository;
import com.soldesk.moa.board.repository.PostRepository;
import com.soldesk.moa.users.entity.Users;
import com.soldesk.moa.users.repository.UsersRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Log4j2
@Service
@RequiredArgsConstructor
@Transactional
public class PostService {

        private final UsersRepository usersRepository;

        private final PostRepository postRepository;

        private final BoardRepository boardRepository;

        @Transactional(readOnly = true)
        public List<PostDTO> findByBoardPostList(Long boardId) {

                List<PostDTO> result = postRepository.findByBoardPost(boardId).stream()
                                .map(post -> PostDTO.builder()
                                                .boardId(post.getBoardId().getBoardId())
                                                .postId(post.getPostId())
                                                .title(post.getTitle())
                                                .content(post.getContent())
                                                .userId(post.getUserId().getUserId())
                                                .viewCount(post.getViewCount())
                                                // .replyCnt(0)
                                                .createDate(post.getCreateDate())
                                                .updateDate(post.getUpdateDate())
                                                .build())
                                .toList();
                return result;

        };

        @Transactional(readOnly = true)
        public PostDTO findByBoardPostRead(Long boardId, Long postId) {
                Post post = postRepository.findByBoardPostRead(boardId, postId)
                                .orElseThrow(() -> new IllegalArgumentException("post not found" + postId));
                return PostDTO.builder()
                                .boardId(post.getBoardId().getBoardId())
                                .postId(post.getPostId())
                                .title(post.getTitle())
                                .content(post.getContent())
                                .userId(post.getUserId().getUserId())
                                .viewCount(post.getViewCount())
                                // .replyCnt(0)
                                .createDate(post.getCreateDate())
                                .updateDate(post.getUpdateDate())
                                .build();
        }

        public Long create(PostDTO dto) {
                Users user = usersRepository.findById(dto.getUserId())
                                .orElseThrow(() -> new IllegalArgumentException("user not found" + dto.getUserId()));
                Board board = boardRepository.findById(dto.getBoardId())
                                .orElseThrow(() -> new IllegalArgumentException("board not found" + dto.getBoardId()));
                Post post = Post.builder()
                                .title(dto.getTitle())
                                .content(dto.getContent())
                                .userId(user) // Users 엔티티
                                .boardId(board) // Board 엔티티
                                .build();
                return postRepository.save(post).getPostId();
        }

        public Long update(PostDTO dto) {
                Post post = postRepository.findById(dto.getPostId())
                                .orElseThrow(() -> new IllegalArgumentException("post not found" + dto.getPostId()));
                post.changeTitle(dto.getTitle());
                post.changeContent(dto.getContent());

                return post.getPostId();
        }

        public void delete(Long postId) {
                postRepository.deleteById(postId);

        }

}
