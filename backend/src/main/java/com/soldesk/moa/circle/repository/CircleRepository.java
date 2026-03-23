package com.soldesk.moa.circle.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import com.soldesk.moa.circle.entity.Circle;
import com.soldesk.moa.circle.entity.constant.CircleStatus;

public interface CircleRepository extends JpaRepository<Circle, Long>, CircleRepositoryCustom {

    List<Circle> findByStatus(CircleStatus status);

    // 모든 서클의 currentMember를 실제 ACTIVE 멤버 수로 동기화
    @Modifying
    @Transactional
    @Query("UPDATE Circle c SET c.currentMember = (SELECT COUNT(m) FROM CircleMember m WHERE m.circle = c AND m.status = 'ACTIVE')")
    void syncAllCurrentMembers();

    // currentMember >= maxMember 인 서클을 FULL로 변경
    @Modifying
    @Transactional
    @Query("UPDATE Circle c SET c.status = 'FULL' WHERE c.currentMember >= c.maxMember AND c.status = 'OPEN'")
    void syncFullStatus();

    @Modifying
    @Transactional
    @Query("UPDATE Circle c SET c.coverImage = null WHERE c.coverImage IS NOT NULL")
    void clearAllCoverImages();
}
