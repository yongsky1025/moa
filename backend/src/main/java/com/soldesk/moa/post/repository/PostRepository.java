package com.soldesk.moa.post.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.soldesk.moa.board.entity.Board;
import com.soldesk.moa.board.entity.constant.BoardType;
import com.soldesk.moa.post.entity.Post;

public interface PostRepository extends JpaRepository<Post, Long> {

  // ===== Global =====
  // 글로벌 게시판 리스트 조회
  @Query("""
        select p
        from Post p
        join p.boardId b
        where b.boardType = :type
          and b.circleId is null
          and b.deleted = false
          and p.deleted = false
        order by p.postId desc
      """)
  List<Post> findGlobalPosts(@Param("type") BoardType type);

  // 글로벌 게시판 게시글 조회
  @Query("""
        select p
        from Post p
        join p.boardId b
        where p.postId = :postId
          and b.boardType = :type
          and b.circleId is null
          and b.deleted = false
          and p.deleted = false
      """)
  Optional<Post> findGlobalPost(@Param("type") BoardType type, @Param("postId") Long postId);

  // 댓글 갯수 포함 글로벌 게시글 조회
  // 공지/자유/지원 (글로벌)
  @Query("""
          select p, count(r)
          from Post p
          left join Reply r on r.postId = p and r.deleted = false
          where p.boardId.boardType = :type
            and p.boardId.circleId is null
            and p.boardId.deleted = false
            and p.deleted = false
          group by p
          order by p.postId desc
      """)
  List<Object[]> findGlobalPostsWithReplyCount(@Param("type") BoardType type);

  // ===== Circle =====
  @Query("""
        select p
        from Post p
        join p.boardId b
        where b.boardType = 'CIRCLE'
          and b.boardId = :boardId
          and b.circleId.circleId = :circleId
          and b.deleted = false
          and p.deleted = false
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
          and b.deleted = false
          and p.deleted = false
      """)
  Optional<Post> findCirclePost(@Param("circleId") Long circleId,
      @Param("boardId") Long boardId,
      @Param("postId") Long postId);

  // 써클 보드 게시물 댓글포함
  // 써클 - 특정 보드
  @Query("""
          select p, count(r)
          from Post p
          left join Reply r on r.postId = p and r.deleted = false
          where p.boardId.boardType = 'CIRCLE'
            and p.boardId.circleId.circleId = :circleId
            and p.boardId.boardId = :boardId
            and p.boardId.deleted = false
            and p.deleted = false
          group by p
          order by p.postId desc
      """)
  List<Object[]> findCirclePostsWithReplyCount(@Param("circleId") Long circleId,
      @Param("boardId") Long boardId);

  // 써클 모든 보드의 게시물

  // 써클 - 모든 보드
  @Query("""
          select p, count(r)
          from Post p
          left join Reply r on r.postId = p and r.deleted = false
          where p.boardId.boardType = 'CIRCLE'
            and p.boardId.circleId.circleId = :circleId
            and p.boardId.deleted = false
            and p.deleted = false
          group by p
          order by p.postId desc
      """)
  List<Object[]> findCirclePostsAllBoardsWithReplyCount(@Param("circleId") Long circleId);

  Optional<Post> findByPostIdAndDeletedFalseAndBoardId_DeletedFalse(Long postId);

  @Modifying
  @Query("update Post p set p.deleted = true where p.boardId.boardId = :boardId and p.deleted = false")
  int softDeleteByBoardId(@Param("boardId") Long boardId);

  @Modifying
  @Query("update Post p set p.viewCount = p.viewCount + 1 where p.postId = :postId")
  int incrementViewCount(@Param("postId") Long postId);

}
