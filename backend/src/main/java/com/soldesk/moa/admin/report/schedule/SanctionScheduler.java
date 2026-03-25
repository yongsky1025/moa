package com.soldesk.moa.admin.report.schedule;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.soldesk.moa.admin.dashboard.repository.AdminCircleRepository;
import com.soldesk.moa.admin.report.entity.Sanction;
import com.soldesk.moa.admin.report.repository.SanctionRepository;
import com.soldesk.moa.circle.entity.constant.CircleStatus;
import com.soldesk.moa.users.entity.constant.UserStatus;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Component
@RequiredArgsConstructor
@Log4j2
public class SanctionScheduler {

    private final SanctionRepository sanctionRepository;
    private final AdminCircleRepository adminCircleRepository;

    // 제재 기한이 지나면 자동으로 활동 정지 해제
    @Transactional
    @Scheduled(fixedDelay = 60_000)
    public void autoLiftExpiredSanctions() {
        List<Sanction> expired = sanctionRepository.findExpiredActiveSanctions(LocalDateTime.now());
        expired.forEach(sanction -> {
            sanction.lift();

            switch (sanction.getTargetType()) {
                case USER:
                    sanction.getTargetUser().changeUserStatus(UserStatus.ACTIVE);
                    log.info("제재 기간 종료 sanctionId={}, userId={}", sanction.getId(),
                            sanction.getTargetUser().getUserId());
                    break;
                case CIRCLE: // 스케줄러에 진입하지 않지만(endat == null이기에) 혹시 모를 방어코드
                    adminCircleRepository.findById(sanction.getTargetId())
                            .ifPresent(circle -> {
                                if (circle.getStatus() != CircleStatus.CLOSED) {
                                    circle.setStatus(CircleStatus.OPEN);
                                }
                                log.info("[자동 해제 - 모임] sanctionId={}, circleId={}",
                                        sanction.getId(),
                                        sanction.getTargetId());
                            });
                    break;
                default:
                    log.warn("[자동 해제 - 처리 없음] sanctionId={}, targetType={}",
                            sanction.getId(),
                            sanction.getTargetType());
                    break;
            }
        });
    }

}
