package com.soldesk.moa.post.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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

  @Query("""
          select p, count(r)
          from Post p
          left join Reply r on r.postId = p and r.deleted = false
          where p.boardId.boardId = :boardId
            and p.boardId.circleId is null
            and p.boardId.deleted = false
            and p.deleted = false
          group by p
          order by p.postId desc
      """)
  List<Object[]> findGlobalPostsWithReplyCountByBoardId(@Param("boardId") Long boardId);

  @Query("""
        select p
        from Post p
        join p.boardId b
        where p.postId = :postId
          and b.boardId = :boardId
          and b.circleId is null
          and b.deleted = false
          and p.deleted = false
      """)
  Optional<Post> findGlobalPostByBoardId(
      @Param("boardId") Long boardId,
      @Param("postId") Long postId);

  @Query("""
          select p, count(r)
          from Post p
          left join Reply r on r.postId = p and r.deleted = false
          where p.boardId.deleted = false
            and p.deleted = false
            and p.boardId.circleId is null
            and (
                 (:globalBoardId is null and (:boardType is null and p.boardId.boardType in (com.soldesk.moa.board.entity.constant.BoardType.FREE, com.soldesk.moa.board.entity.constant.BoardType.NOTICE)))
              or (:globalBoardId is null and (:boardType is not null and p.boardId.boardType = :boardType))
              or (:globalBoardId is not null and p.boardId.boardId = :globalBoardId)
            )
          group by p
          order by p.createDate desc
      """)
  List<Object[]> findCommunityPostsByRecent(
      @Param("boardType") BoardType boardType,
      @Param("globalBoardId") Long globalBoardId,
      Pageable pageable);

  @Query("""
          select p, count(r)
          from Post p
          left join Reply r on r.postId = p and r.deleted = false
          where p.boardId.deleted = false
            and p.deleted = false
            and p.boardId.circleId is null
            and (
                 (:globalBoardId is null and (:boardType is null and p.boardId.boardType in (com.soldesk.moa.board.entity.constant.BoardType.FREE, com.soldesk.moa.board.entity.constant.BoardType.NOTICE)))
              or (:globalBoardId is null and (:boardType is not null and p.boardId.boardType = :boardType))
              or (:globalBoardId is not null and p.boardId.boardId = :globalBoardId)
            )
          group by p
          order by p.viewCount desc, p.createDate desc
      """)
  List<Object[]> findCommunityPostsByViews(
      @Param("boardType") BoardType boardType,
      @Param("globalBoardId") Long globalBoardId,
      Pageable pageable);

  @Query("""
          select p, count(r)
          from Post p
          left join Reply r on r.postId = p and r.deleted = false
          where p.boardId.deleted = false
            and p.deleted = false
            and p.boardId.circleId is null
            and (
                 (:globalBoardId is null and (:boardType is null and p.boardId.boardType in (com.soldesk.moa.board.entity.constant.BoardType.FREE, com.soldesk.moa.board.entity.constant.BoardType.NOTICE)))
              or (:globalBoardId is null and (:boardType is not null and p.boardId.boardType = :boardType))
              or (:globalBoardId is not null and p.boardId.boardId = :globalBoardId)
            )
          group by p
          order by count(r) desc, p.createDate desc
      """)
  List<Object[]> findCommunityPostsByReplies(
      @Param("boardType") BoardType boardType,
      @Param("globalBoardId") Long globalBoardId,
      Pageable pageable);

  @Query(
      value = """
          select p, count(r)
          from Post p
          left join Reply r on r.postId = p and r.deleted = false
          where p.boardId.deleted = false
            and p.deleted = false
            and p.boardId.circleId is null
            and (
                 (:globalBoardId is null and (:boardType is null and p.boardId.boardType in (com.soldesk.moa.board.entity.constant.BoardType.FREE, com.soldesk.moa.board.entity.constant.BoardType.NOTICE)))
              or (:globalBoardId is null and (:boardType is not null and p.boardId.boardType = :boardType))
              or (:globalBoardId is not null and p.boardId.boardId = :globalBoardId)
            )
          group by p
          order by case
              when p.boardId.boardType = com.soldesk.moa.board.entity.constant.BoardType.NOTICE and p.pinned = true then 0
              else 1
            end asc,
            p.pinnedAt desc,
            p.createDate desc
          """,
      countQuery = """
          select count(p)
          from Post p
          where p.boardId.deleted = false
            and p.deleted = false
            and p.boardId.circleId is null
            and (
                 (:globalBoardId is null and (:boardType is null and p.boardId.boardType in (com.soldesk.moa.board.entity.constant.BoardType.FREE, com.soldesk.moa.board.entity.constant.BoardType.NOTICE)))
              or (:globalBoardId is null and (:boardType is not null and p.boardId.boardType = :boardType))
              or (:globalBoardId is not null and p.boardId.boardId = :globalBoardId)
            )
          """)
  Page<Object[]> findCommunityPostsPaged(
      @Param("boardType") BoardType boardType,
      @Param("globalBoardId") Long globalBoardId,
      Pageable pageable);

  @Query("""
          select p
          from Post p
          join p.boardId b
          where p.userId.userId = :userId
            and b.deleted = false
            and p.deleted = false
            and b.circleId is null
            and (
                 (:globalBoardId is null and (:boardType is null and b.boardType in (com.soldesk.moa.board.entity.constant.BoardType.FREE, com.soldesk.moa.board.entity.constant.BoardType.NOTICE)))
              or (:globalBoardId is null and (:boardType is not null and b.boardType = :boardType))
              or (:globalBoardId is not null and b.boardId = :globalBoardId)
            )
          order by p.createDate desc
      """)
  List<Post> findMyCommunityPosts(
      @Param("userId") Long userId,
      @Param("boardType") BoardType boardType,
      @Param("globalBoardId") Long globalBoardId);

  @Query("""
          select p
          from Post p
          join p.boardId b
          where p.userId.userId = :userId
            and b.deleted = false
            and p.deleted = false
            and b.boardType = com.soldesk.moa.board.entity.constant.BoardType.CIRCLE
            and b.circleId.circleId = :circleId
            and (:boardId is null or b.boardId = :boardId)
          order by p.createDate desc
      """)
  List<Post> findMyCirclePosts(
      @Param("userId") Long userId,
      @Param("circleId") Long circleId,
      @Param("boardId") Long boardId);

  @Query("""
          select distinct p
          from Reply r
          join r.postId p
          join p.boardId b
          where r.userId.userId = :userId
            and r.deleted = false
            and b.deleted = false
            and p.deleted = false
            and b.circleId is null
            and (
                 (:globalBoardId is null and (:boardType is null and b.boardType in (com.soldesk.moa.board.entity.constant.BoardType.FREE, com.soldesk.moa.board.entity.constant.BoardType.NOTICE)))
              or (:globalBoardId is null and (:boardType is not null and b.boardType = :boardType))
              or (:globalBoardId is not null and b.boardId = :globalBoardId)
            )
          order by p.createDate desc
      """)
  List<Post> findMyRepliedCommunityPosts(
      @Param("userId") Long userId,
      @Param("boardType") BoardType boardType,
      @Param("globalBoardId") Long globalBoardId);

  @Query("""
      select count(p)
      from Post p
      join p.boardId b
      where b.boardType = com.soldesk.moa.board.entity.constant.BoardType.NOTICE
        and b.circleId is null
        and b.deleted = false
        and p.deleted = false
        and p.pinned = true
      """)
  long countPinnedNoticePosts();

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

  @Query("""
          select p, count(r)
          from Post p
          join p.boardId b
          left join Reply r on r.postId = p and r.deleted = false
          where b.boardType = com.soldesk.moa.board.entity.constant.BoardType.CIRCLE
            and b.circleBoardKind = com.soldesk.moa.board.entity.constant.CircleBoardKind.ACTIVITY
            and p.activityPublic = true
            and b.deleted = false
            and p.deleted = false
          group by p
          order by p.createDate desc
      """)
  List<Object[]> findPublicCircleActivityPostsWithReplyCount(Pageable pageable);

  @Query("""
          select p
          from Post p
          join p.boardId b
          where p.postId = :postId
            and b.boardType = com.soldesk.moa.board.entity.constant.BoardType.CIRCLE
            and b.circleBoardKind = com.soldesk.moa.board.entity.constant.CircleBoardKind.ACTIVITY
            and p.activityPublic = true
            and b.deleted = false
            and p.deleted = false
      """)
  Optional<Post> findPublicCircleActivityPost(@Param("postId") Long postId);

  Optional<Post> findByPostIdAndDeletedFalseAndBoardId_DeletedFalse(Long postId);

  @Query("""
      select p
      from Post p
      join fetch p.boardId b
      join fetch p.userId u
      where p.postId = :postId
        and p.deleted = false
        and b.deleted = false
      """)
  Optional<Post> findActivePostForSearchIndex(@Param("postId") Long postId);

  @Query("""
      select p
      from Post p
      join fetch p.boardId b
      join fetch p.userId u
      where p.deleted = false
        and b.deleted = false
      order by p.postId asc
      """)
  Slice<Post> findActivePostsForSearchIndex(Pageable pageable);

  @Query("""
      select count(p)
      from Post p
      join p.boardId b
      where p.deleted = false
        and b.deleted = false
      """)
  long countActivePostsForSearchIndex();

  @Query("""
      select p
      from Post p
      join p.boardId b
      join p.userId u
      where p.deleted = false
        and b.deleted = false
        and (:keyword = '' or
             lower(p.title) like lower(concat('%', :keyword, '%')) or
             p.content like concat('%', :keyword, '%') or
             lower(u.name) like lower(concat('%', :keyword, '%')))
        and (
             (:boardId is not null and b.boardId = :boardId)
          or (:boardId is null and :boardType is null and b.boardType in (com.soldesk.moa.board.entity.constant.BoardType.FREE, com.soldesk.moa.board.entity.constant.BoardType.NOTICE))
          or (:boardId is null and :boardType is not null and :boardType <> com.soldesk.moa.board.entity.constant.BoardType.CIRCLE and b.boardType = :boardType)
          or (:boardId is null and :boardType = com.soldesk.moa.board.entity.constant.BoardType.CIRCLE and b.boardType = com.soldesk.moa.board.entity.constant.BoardType.CIRCLE and b.circleId.circleId = :circleId)
        )
      order by p.createDate desc
      """)
  Page<Post> searchPostsForFallback(
      @Param("keyword") String keyword,
      @Param("boardType") BoardType boardType,
      @Param("boardId") Long boardId,
      @Param("circleId") Long circleId,
      Pageable pageable);

  @Modifying
  @Query("""
      update Post p
         set p.deleted = true,
             p.updateDate = CURRENT_TIMESTAMP
       where p.boardId.boardId = :boardId
         and p.deleted = false
      """)
  int softDeleteByBoardId(@Param("boardId") Long boardId);

  @Modifying
  @Query("update Post p set p.viewCount = p.viewCount + 1 where p.postId = :postId")
  int incrementViewCount(@Param("postId") Long postId);

  @Modifying
  @Query("update Post p set p.likeCount = p.likeCount + 1 where p.postId = :postId")
  int incrementLikeCount(@Param("postId") Long postId);

  @Modifying
  @Query("update Post p set p.likeCount = p.likeCount - 1 where p.postId = :postId and p.likeCount > 0")
  int decrementLikeCount(@Param("postId") Long postId);

  @Modifying
  @Query("""
      delete from Post p
       where p.deleted = true
         and p.updateDate < :cutoff
      """)
  int hardDeleteSoftDeletedBefore(@Param("cutoff") java.time.LocalDateTime cutoff);

  @Query("""
      select p.postId
      from Post p
      where p.deleted = true
        and p.updateDate < :cutoff
      """)
  List<Long> findSoftDeletedPostIdsBefore(@Param("cutoff") java.time.LocalDateTime cutoff);

}
