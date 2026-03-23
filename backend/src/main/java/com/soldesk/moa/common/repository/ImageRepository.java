package com.soldesk.moa.common.repository;

import com.soldesk.moa.common.entity.Image;
import com.soldesk.moa.common.entity.constant.ImageDomain;
import com.soldesk.moa.common.entity.constant.ImageStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;
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

    @Modifying
    @Query("""
            delete from Image i
            where i.imageId in :imageIds
            """)
    int deleteByImageIds(@Param("imageIds") List<Long> imageIds);

    @Query("""
            select i.path
            from Image i
            where i.uploadedByUserId = :userId
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
            where i.domain = :domain
              and i.ownerId = :ownerId
              and i.deleted = false
            """)
    int softDeleteByOwner(@Param("domain") ImageDomain domain, @Param("ownerId") Long ownerId);

    @Modifying
    @Query("""
            update Image i
            set i.deleted = true,
                i.updateDate = CURRENT_TIMESTAMP
            where i.domain = 'POST'
              and i.ownerId in (
                select p.postId
                from Post p
                where p.boardId.boardId = :boardId
              )
              and i.deleted = false
            """)
    int softDeleteByBoardId(@Param("boardId") Long boardId);

    @Modifying
    @Query("""
            update Image i
            set i.deleted = false,
                i.updateDate = CURRENT_TIMESTAMP
            where i.domain = :domain
              and i.ownerId = :ownerId
              and i.deleted = true
            """)
    int restoreByOwner(@Param("domain") ImageDomain domain, @Param("ownerId") Long ownerId);

    @Modifying
    @Query("""
            update Image i
            set i.status = :toStatus,
                i.domain = :domain,
                i.ownerId = :ownerId,
                i.updateDate = CURRENT_TIMESTAMP
            where i.uploadedByUserId = :userId
              and i.status = :fromStatus
              and i.path in :paths
            """)
    int updateStatusAndOwnerByUserAndPaths(@Param("userId") Long userId,
            @Param("paths") List<String> paths,
            @Param("fromStatus") ImageStatus fromStatus,
            @Param("toStatus") ImageStatus toStatus,
            @Param("domain") ImageDomain domain,
            @Param("ownerId") Long ownerId);

    @Modifying
    @Query("""
            delete from Image i
            where i.deleted = true
              and i.updateDate < :cutoff
            """)
    int hardDeleteSoftDeletedBefore(@Param("cutoff") java.time.LocalDateTime cutoff);

    Optional<Image> findFirstByDomainAndOwnerIdAndDeletedFalseAndStatusOrderByUpdateDateDescCreateDateDesc(
            ImageDomain domain,
            Long ownerId,
            ImageStatus status);

    Optional<Image> findFirstByDomainAndOwnerIdAndPathAndDeletedFalseAndStatus(
            ImageDomain domain,
            Long ownerId,
            String path,
            ImageStatus status);

    List<Image> findByOwnerIdIsNotNullAndCreateDateBefore(LocalDateTime cutoff);
}
