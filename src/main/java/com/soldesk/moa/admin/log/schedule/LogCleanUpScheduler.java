package com.soldesk.moa.admin.log.schedule;

import java.time.LocalDateTime;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.soldesk.moa.admin.log.repository.AdminActionLogRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class LogCleanUpScheduler {
    private final AdminActionLogRepository adminActionLogRepository;

    @Scheduled(cron = "0 0 3 * * ?") // 매일 새벽3시에 실행
    public void deleteOldLogs() {
        // 1년 이전 로그 삭제
        // adminActionLogRepository.deleteByCreatedAtBefore(LocalDateTime.now().minusYears(1L)); // timestamp 필드명 불일치로 주석처리
    }
}
