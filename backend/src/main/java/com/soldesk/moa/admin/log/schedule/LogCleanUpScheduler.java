package com.soldesk.moa.admin.log.schedule;

import java.time.LocalDateTime;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.soldesk.moa.admin.log.repository.AdminActionLogRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class LogCleanUpScheduler {
    private final AdminActionLogRepository adminActionLogRepository;

    @Transactional
    @Scheduled(cron = "0 0 3 * * ?") // 매일 새벽3시에 실행
    public void deleteOldLogs() {
        // 1년 이전 로그 삭제
        adminActionLogRepository.deleteByTimestampBefore(LocalDateTime.now().minusYears(1L));
    }
}
