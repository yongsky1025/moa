package com.soldesk.moa.board.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.soldesk.moa.board.entity.Board;
import com.soldesk.moa.board.entity.Post;
import com.soldesk.moa.board.entity.constant.BoardType;

public interface PostRepository extends JpaRepository<Post, Long> {

  // ===== Global =====
  @Query("""
        select p
        from Post p
        join p.boardId b
        where b.boardType = :type
          and b.circleId is null
        order by p.postId desc
      """)
  List<Post> findGlobalPosts(@Param("type") BoardType type);

  @Query("""
        select p
        from Post p
        join p.boardId b
        where p.postId = :postId
          and b.boardType = :type
          and b.circleId is null
      """)
  Optional<Post> findGlobalPost(@Param("type") BoardType type, @Param("postId") Long postId);

  // ===== Circle =====
  @Query("""
        select p
        from Post p
        join p.boardId b
        where b.boardType = 'CIRCLE'
          and b.boardId = :boardId
          and b.circleId.circleId = :circleId
        order by p.postId desc
      """)
  List<Post> findCirclePosts(@Param("circleId") Long circleId, @Param("boardId") Long boardId);

  @Query("""
        select p
        from Post p
        join p.boardId b
        where p.postId = :postId
          and b.boardType = 'CIRCLE'
          and b.boardId = :boardId
          and b.circleId.circleId = :circleId
      """)
  Optional<Post> findCirclePost(@Param("circleId") Long circleId,
      @Param("boardId") Long boardId,
      @Param("postId") Long postId);

  @Modifying
  @Query("update Post p set p.viewCount = p.viewCount + 1 where p.postId = :postId")
  int incrementViewCount(@Param("postId") Long postId);

}
