package com.soldesk.moa.board.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.soldesk.moa.board.dto.PostDTO;
import com.soldesk.moa.board.entity.Board;
import com.soldesk.moa.board.entity.Post;
import com.soldesk.moa.board.entity.constant.BoardRole;

public interface PostRepository extends JpaRepository<Post, Long> {

        @Query("select p from Post p where p.boardId.boardId = :boardId")
        List<Post> findByBoardPost(
                        @Param("boardId") Long boardId);

        @Query("select p from Post p where p.boardId.boardId = :boardId and p.postId = :postId")
        Optional<Post> findByBoardPostRead(
                        @Param("boardId") Long boardId,
                        @Param("postId") Long postId);
}
