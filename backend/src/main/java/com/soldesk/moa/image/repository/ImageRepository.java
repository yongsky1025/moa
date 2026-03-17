package com.soldesk.moa.image.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.soldesk.moa.image.entity.Image;

public interface ImageRepository extends JpaRepository<Image, Long> {

    List<Image> findByUser_UserIdAndTempKeyOrderByOrdAscImageIdAsc(Long userId, String tempKey);

    Optional<Image> findByImageIdAndUser_UserId(Long imageId, Long userId);

    Optional<Image> findByImageIdAndUser_UserIdAndTempKey(Long imageId, Long userId, String tempKey);

    @Query("""
            select coalesce(max(i.ord), -1)
            from Image i
            where i.user.userId = :userId
              and i.tempKey = :tempKey
            """)
    Long findMaxOrdByUserAndTempKey(@Param("userId") Long userId, @Param("tempKey") String tempKey);

    List<Image> findByTemporaryIsTrueAndUploadedAtBefore(LocalDateTime cutoff);
}
