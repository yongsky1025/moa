package com.soldesk.moa.common.repository;

import com.soldesk.moa.common.entity.Image;
import com.soldesk.moa.common.entity.constant.ImageStatus;
import com.soldesk.moa.post.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.time.LocalDateTime;

public interface ImageRepository extends JpaRepository<Image, Long> {
    @Query("""
            select i
            from Image i
            where i.status = :status
              and i.createDate < :cutoff
            """)
    List<Image> findByStatusAndCreateDateBefore(@Param("status") ImageStatus status,
            @Param("cutoff") LocalDateTime cutoff);

    @Modifying
    @Query("""
            delete from Image i
            where i.imageId in :imageIds
              and i.status = :status
            """)
    int deleteByImageIdsAndStatus(@Param("imageIds") List<Long> imageIds, @Param("status") ImageStatus status);

    @Query("""
            select i.path
            from Image i
            where i.user.userId = :userId
              and i.status = :status
              and i.path in :paths
            """)
    List<String> findPathsByUserAndStatusAndPathIn(@Param("userId") Long userId,
            @Param("status") ImageStatus status,
            @Param("paths") List<String> paths);

    @Modifying
    @Query("""
            update Image i
            set i.deleted = true,
                i.updateDate = CURRENT_TIMESTAMP
            where i.post = :post
              and i.deleted = false
            """)
    int softDeleteByPost(@Param("post") Post post);

    @Modifying
    @Query("""
            update Image i
            set i.deleted = true,
                i.updateDate = CURRENT_TIMESTAMP
            where i.post is not null
              and i.post.boardId.boardId = :boardId
              and i.deleted = false
            """)
    int softDeleteByBoardId(@Param("boardId") Long boardId);

    @Modifying
    @Query("""
            update Image i
            set i.deleted = false,
                i.updateDate = CURRENT_TIMESTAMP
            where i.post = :post
              and i.deleted = true
            """)
    int restoreByPost(@Param("post") Post post);

    @Modifying
    @Query("""
            update Image i
            set i.status = :toStatus,
                i.post = :post,
                i.updateDate = CURRENT_TIMESTAMP
            where i.user.userId = :userId
              and i.status = :fromStatus
              and i.path in :paths
            """)
    int updateStatusAndPostByUserAndPaths(@Param("userId") Long userId,
            @Param("paths") List<String> paths,
            @Param("fromStatus") ImageStatus fromStatus,
            @Param("toStatus") ImageStatus toStatus,
            @Param("post") Post post);

    @Modifying
    @Query("""
            delete from Image i
            where i.deleted = true
              and i.updateDate < :cutoff
            """)
    int hardDeleteSoftDeletedBefore(@Param("cutoff") java.time.LocalDateTime cutoff);
}
