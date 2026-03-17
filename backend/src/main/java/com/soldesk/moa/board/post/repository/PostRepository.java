package com.soldesk.moa.board.post.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.soldesk.moa.board.post.dto.PostCardResponseDTO;
import com.soldesk.moa.board.board.entity.Board;
import com.soldesk.moa.board.post.entity.Post;
import com.soldesk.moa.board.board.entity.constant.BoardType;

public interface PostRepository extends JpaRepository<Post, Long>, PostSearchRepository {

  // ===== Global =====
  // 글로벌 게시판 리스트 조회
  @Query("""
        select p
        from Post p
        join p.boardId b
        where b.boardType = :type
          and b.circleId is null
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
      """)
  Optional<Post> findGlobalPost(@Param("type") BoardType type, @Param("postId") Long postId);

  // 댓글 갯수 포함 글로벌 게시글 조회
  // 공지/자유 (글로벌)
  @Query("""
          select p, count(r)
          from Post p
          left join Reply r on r.postId = p
          where p.boardId.boardType = :type
            and p.boardId.circleId is null
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

  // 써클 보드 게시물 댓글포함
  // 써클 - 특정 보드
  @Query("""
          select p, count(r)
          from Post p
          left join Reply r on r.postId = p
          where p.boardId.boardType = 'CIRCLE'
            and p.boardId.circleId.circleId = :circleId
            and p.boardId.boardId = :boardId
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
          left join Reply r on r.postId = p
          where p.boardId.boardType = 'CIRCLE'
            and p.boardId.circleId.circleId = :circleId
          group by p
          order by p.postId desc
      """)
  List<Object[]> findCirclePostsAllBoardsWithReplyCount(@Param("circleId") Long circleId);

  @Query("""
        select new com.soldesk.moa.board.post.dto.PostCardResponseDTO(
          p.postId,
          b.boardId,
          b.name,
          p.title,
          u.name,
          ti.path,
          p.createDate,
          p.viewCount,
          count(r)
        )
        from Post p
        join p.boardId b
        join p.userId u
        left join p.postImages pi on pi.usageType = com.soldesk.moa.board.post.entity.constant.PostImageUsageType.THUMBNAIL
        left join pi.image ti
        left join Reply r on r.postId = p
        where b.boardType = :type
          and b.circleId is null
        group by p.postId, b.boardId, b.name, p.title, u.name, ti.path, p.createDate, p.viewCount
        order by p.postId desc
      """)
  List<PostCardResponseDTO> findGlobalPostCards(@Param("type") BoardType type);

  @Query("""
        select new com.soldesk.moa.board.post.dto.PostCardResponseDTO(
          p.postId,
          b.boardId,
          b.name,
          p.title,
          u.name,
          ti.path,
          p.createDate,
          p.viewCount,
          count(r)
        )
        from Post p
        join p.boardId b
        join p.userId u
        left join p.postImages pi on pi.usageType = com.soldesk.moa.board.post.entity.constant.PostImageUsageType.THUMBNAIL
        left join pi.image ti
        left join Reply r on r.postId = p
        where b.boardType = 'CIRCLE'
          and b.circleId.circleId = :circleId
          and (:boardId is null or b.boardId = :boardId)
        group by p.postId, b.boardId, b.name, p.title, u.name, ti.path, p.createDate, p.viewCount
        order by p.postId desc
      """)
  List<PostCardResponseDTO> findCirclePostCards(@Param("circleId") Long circleId, @Param("boardId") Long boardId);

  @Query("""
        select new com.soldesk.moa.board.post.dto.PostCardResponseDTO(
          p.postId,
          b.boardId,
          b.name,
          p.title,
          u.name,
          ti.path,
          p.createDate,
          p.viewCount,
          count(r)
        )
        from Post p
        join p.boardId b
        join p.userId u
        left join p.postImages pi on pi.usageType = com.soldesk.moa.board.post.entity.constant.PostImageUsageType.THUMBNAIL
        left join pi.image ti
        left join Reply r on r.postId = p
        where u.userId = :userId
        group by p.postId, b.boardId, b.name, p.title, u.name, ti.path, p.createDate, p.viewCount
        order by p.postId desc
      """)
  List<PostCardResponseDTO> findMyPostCards(@Param("userId") Long userId);

  @Modifying
  @Query("update Post p set p.viewCount = p.viewCount + 1 where p.postId = :postId")
  int incrementViewCount(@Param("postId") Long postId);

}
