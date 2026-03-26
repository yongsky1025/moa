package com.soldesk.moa.place.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.soldesk.moa.common.entity.Image;
import com.soldesk.moa.common.entity.constant.ImageDomain;
import com.soldesk.moa.common.entity.constant.ImageStatus;

public interface PlaceImageRepository extends JpaRepository<Image, Long> {

    List<Image> findByDomainAndOwnerIdAndDeletedFalse(ImageDomain domain, Long placeId);

    /** TEMP 이미지를 장소에 연결하면서 ord(순서) 지정 */
    @Modifying
    @Query("""
            update Image i
            set i.status = :toStatus,
                i.domain = :domain,
                i.ownerId = :ownerId,
                i.ord = :ord,
                i.updateDate = CURRENT_TIMESTAMP
            where i.uploadedByUserId = :userId
              and i.status = :fromStatus
              and i.path = :path
            """)
    int linkImageWithOrd(@Param("userId") Long userId,
            @Param("path") String path,
            @Param("fromStatus") ImageStatus fromStatus,
            @Param("toStatus") ImageStatus toStatus,
            @Param("domain") ImageDomain domain,
            @Param("ownerId") Long ownerId,
            @Param("ord") Long ord);

    /** 기존 이미지(USED)의 ord만 업데이트 */
    @Modifying
    @Query("""
            update Image i
            set i.ord = :ord,
                i.updateDate = CURRENT_TIMESTAMP
            where i.domain = :domain
              and i.ownerId = :ownerId
              and i.path = :path
              and i.deleted = false
            """)
    int updateOrd(@Param("domain") ImageDomain domain,
            @Param("ownerId") Long ownerId,
            @Param("path") String path,
            @Param("ord") Long ord);

    /** 여러 장소의 대표이미지(ord=0)를 한 번에 조회 */
    @Query("select i from Image i where i.domain = :domain and i.ownerId in :ownerIds and i.ord = 0 and i.deleted = false")
    List<Image> findRepresentativeImages(@Param("domain") ImageDomain domain, @Param("ownerIds") List<Long> ownerIds);

    /** 새 목록에 없는 이미지 soft delete (차등 삭제) */
    @Modifying
    @Query("""
            update Image i
            set i.deleted = true,
                i.updateDate = CURRENT_TIMESTAMP
            where i.domain = :domain
              and i.ownerId = :ownerId
              and i.path not in :paths
              and i.deleted = false
            """)
    int softDeleteExcludingPaths(@Param("domain") ImageDomain domain,
            @Param("ownerId") Long ownerId,
            @Param("paths") List<String> paths);
}
