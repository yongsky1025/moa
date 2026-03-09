package com.soldesk.moa.admin.log.repository;

import java.time.LocalDateTime;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.soldesk.moa.admin.log.entity.AdminActionLog;

public interface AdminActionLogRepository extends JpaRepository<AdminActionLog, Long> {

    // log 페이징 처리(전체)
    Page<AdminActionLog> findAll(Pageable pageable);

    // 유저별 log 페이징 처리
    Page<AdminActionLog> findByActorId(Long actorId, Pageable pageable);

    // log 1년 이상된 데이터 삭제
    void deleteByCreatedAtBefore(LocalDateTime dateTime);
}
