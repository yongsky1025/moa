package com.soldesk.moa.post.repository;

import java.util.Optional;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.soldesk.moa.board.entity.constant.BoardType;
import com.soldesk.moa.post.entity.PostBookmark;
import com.soldesk.moa.post.entity.Post;

public interface PostBookmarkRepository extends JpaRepository<PostBookmark, Long> {
    Optional<PostBookmark> findByPost_PostIdAndUser_UserId(Long postId, Long userId);

    @Query("""
            select p
            from PostBookmark pb
            join pb.post p
            join p.boardId b
            where pb.user.userId = :userId
              and b.deleted = false
              and p.deleted = false
              and (
                   (:boardType is null and b.boardType in (com.soldesk.moa.board.entity.constant.BoardType.FREE, com.soldesk.moa.board.entity.constant.BoardType.NOTICE))
                or (:boardType is not null and b.boardType = :boardType)
              )
            order by p.createDate desc
            """)
    List<Post> findBookmarkedPostsByUserId(
            @Param("userId") Long userId,
            @Param("boardType") BoardType boardType);

    @Query("""
            select p
            from PostBookmark pb
            join pb.post p
            join p.boardId b
            where pb.user.userId = :userId
              and b.deleted = false
              and p.deleted = false
              and b.boardType = com.soldesk.moa.board.entity.constant.BoardType.CIRCLE
              and b.circleId.circleId = :circleId
              and (:boardId is null or b.boardId = :boardId)
            order by p.createDate desc
            """)
    List<Post> findBookmarkedCirclePostsByUserId(
            @Param("userId") Long userId,
            @Param("circleId") Long circleId,
            @Param("boardId") Long boardId);

    @Query("""
            select p
            from PostBookmark pb
            join pb.post p
            join p.boardId b
            where pb.user.userId = :userId
              and b.deleted = false
              and p.deleted = false
              and b.boardType = com.soldesk.moa.board.entity.constant.BoardType.CIRCLE
              and b.circleBoardKind = com.soldesk.moa.board.entity.constant.CircleBoardKind.ACTIVITY
              and p.activityPublic = true
            order by p.createDate desc
            """)
    List<Post> findBookmarkedPublicActivityPostsByUserId(@Param("userId") Long userId);

    @Query("""
            select p
            from PostBookmark pb
            join pb.post p
            join p.boardId b
            where pb.user.userId = :userId
              and b.deleted = false
              and p.deleted = false
              and b.boardType = com.soldesk.moa.board.entity.constant.BoardType.CIRCLE
              and b.circleBoardKind = com.soldesk.moa.board.entity.constant.CircleBoardKind.ACTIVITY
              and p.activityPublic = true
              and exists (
                  select cm.id
                  from com.soldesk.moa.circle.entity.CircleMember cm
                  where cm.user.userId = :userId
                    and cm.circle = b.circleId
                    and cm.status = com.soldesk.moa.circle.entity.constant.CircleMemberStatus.ACTIVE
              )
            order by p.createDate desc
            """)
    List<Post> findBookmarkedMemberPublicActivityPostsByUserId(@Param("userId") Long userId);
}
