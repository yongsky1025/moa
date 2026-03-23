package com.soldesk.moa.admin.report.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.soldesk.moa.admin.dashboard.repository.AdminCircleRepository;
import com.soldesk.moa.admin.dashboard.repository.AdminPostRepository;
import com.soldesk.moa.admin.dashboard.repository.AdminReplyRepository;
import com.soldesk.moa.admin.dashboard.repository.AdminUsersRepository;
import com.soldesk.moa.admin.report.dto.SanctionFilterDTO;
import com.soldesk.moa.admin.report.dto.SanctionRequestDTO;
import com.soldesk.moa.admin.report.dto.SanctionResponseDTO;
import com.soldesk.moa.admin.report.entity.Report;
import com.soldesk.moa.admin.report.entity.Sanction;
import com.soldesk.moa.admin.report.entity.constant.ReportStatus;
import com.soldesk.moa.admin.report.entity.constant.ReportTargetType;
import com.soldesk.moa.admin.report.entity.constant.SanctionState;
import com.soldesk.moa.admin.report.entity.constant.SanctionType;
import com.soldesk.moa.admin.report.repository.ReportRepository;
import com.soldesk.moa.admin.report.repository.SanctionRepository;
import com.soldesk.moa.board.entity.Post;
import com.soldesk.moa.board.entity.Reply;
import com.soldesk.moa.circle.entity.Circle;
import com.soldesk.moa.circle.entity.constant.CircleMemberStatus;
import com.soldesk.moa.circle.entity.constant.CircleStatus;
import com.soldesk.moa.circle.repository.CircleMemberRepository;
import com.soldesk.moa.common.dto.PageResultDTO;
import com.soldesk.moa.notification.domain.NotificationType;
import com.soldesk.moa.notification.service.NotificationService;
import com.soldesk.moa.users.entity.Users;
import com.soldesk.moa.users.entity.constant.UserStatus;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Log4j2
public class SanctionService {

    private final SanctionRepository sanctionRepository;
    private final ReportRepository reportRepository;
    private final AdminUsersRepository adminUsersRepository;
    private final AdminPostRepository adminPostRepository;
    private final AdminReplyRepository adminReplyRepository;
    private final AdminCircleRepository adminCircleRepository;
    private final CircleMemberRepository circleMemberRepository;
    private final NotificationService notificationService;

    // 제재 목록 조회
    public PageResultDTO<SanctionResponseDTO> getSanctions(SanctionFilterDTO filter) {
        Pageable pageable = PageRequest.of(filter.getPage() - 1, filter.getSize());
        Page<Sanction> sanctionPage = sanctionRepository.searchSanctions(filter,
                pageable);

        // 엔티티 -> dto
        List<SanctionResponseDTO> dtoList = sanctionPage.getContent().stream()
                .map(this::entityToDto)
                .toList();

        return PageResultDTO.<SanctionResponseDTO>withAll()
                .dtoList(dtoList)
                .pageRequestDTO(filter)
                .totalCount(sanctionPage.getTotalElements())
                .build();
    }

    // 특정 제재 조회
    public SanctionResponseDTO getOneSanction(Long sanctionId) {
        Sanction sanction = sanctionRepository.findById(sanctionId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 제재입니다."));
        return entityToDto(sanction);
    }

    // 제재 처리
    @Transactional
    public void applySanction(Long adminId, SanctionRequestDTO dto) {
        Users admin = adminUsersRepository.findById(adminId)
                .orElseThrow(() -> new IllegalArgumentException("해당 관리자를 찾을 수 없습니다."));
        Users targetUser = adminUsersRepository.findById(dto.targetUserId())
                .orElseThrow(() -> new IllegalArgumentException("대상 유저를 찾을 수 없습니다."));

        // 연관 신고(관리자 직접 제재 시 null가능)
        Report report = null;
        if (dto.reportId() != (Long) null) {
            report = reportRepository.findById(dto.reportId())
                    .orElseThrow(() -> new IllegalArgumentException("신고를 찾을 수 없습니다."));
        }

        sanctionRepository.save(Sanction.builder()
                .report(report)
                .targetUser(targetUser)
                .admin(admin)
                .targetType(dto.targetType())
                .targetId(dto.targetId())
                .sanctionType(dto.sanctionType())
                .reason(dto.reason())
                .startAt(LocalDateTime.now())
                .endAt(calculateEndAt(dto.sanctionType()))
                .build());

        executeSanction(dto, targetUser, admin);

        if (report != null) {
            report.setStatus(ReportStatus.RESOLVED);
        }

    }

    // 제재 일수 정하기
    private LocalDateTime calculateEndAt(SanctionType type) {
        return switch (type) {
            case BAN_1D -> LocalDateTime.now().plusDays(1L);
            case BAN_3D -> LocalDateTime.now().plusDays(3L);
            case BAN_30D -> LocalDateTime.now().plusDays(30L);
            default -> null;
        };
    }

    // 대상 타입별로 제재를 실행하는 메소드
    private void executeSanction(SanctionRequestDTO dto, Users targetUser, Users admin) {
        switch (dto.targetType()) {
            case USER -> executeUserSanction(dto, targetUser, admin);

            case POST -> adminPostRepository.findById(dto.targetId())
                    .orElseThrow(() -> new IllegalArgumentException("게시글을 찾을 수 없습니다."))
                    .markDeleted();

            case REPLY -> adminReplyRepository.findById(dto.targetId())
                    .orElseThrow(() -> new IllegalArgumentException("댓글을 찾을 수 없습니다."))
                    .markDeleted();

            case CIRCLE -> executeCircleSanction(dto);

        }
    };

    // 타입 user용 제재 실행메소드
    private void executeUserSanction(SanctionRequestDTO dto, Users targetUser, Users admin) {
        // 재재 카운트 추가
        targetUser.increaseSanctionCount();
        int count = targetUser.getSanctionCount();

        log.info("제재 횟수 증가 userId={}, sancCount={}", targetUser.getUserId(), targetUser.getSanctionCount());

        // 5회 도달 - 자동 영구 밴
        if (count >= 5) {
            // 5회가 되면 제재 타입에 상관없이 자동으로 영구 밴
            sanctionRepository.save(Sanction.builder()
                    .report(null) // 연관신고없이 제재횟수 누적으로 밴
                    .targetUser(targetUser)
                    .admin(admin)
                    .targetType(ReportTargetType.USER)
                    .targetId(targetUser.getUserId())
                    .sanctionType(SanctionType.PERMANENT_BAN)
                    .reason("제재 " + count + "회 누적으로 인한 자동 영구이용정지")
                    .startAt(LocalDateTime.now())
                    .endAt(null) // 영구
                    .build());

            targetUser.setUserStatus(UserStatus.BANNED);

            log.info("5회 누적 자동 영구밴 userId={}", targetUser.getUserId());
            return;
        }

        // 제재 횟수 1~4회 : 관리자가 결정한 제재타입으로 처리

        // 1회는 경고인데 다른 제재 넣을경우 막기
        if (count == 1 && dto.sanctionType() != SanctionType.WARNING) {
            throw new IllegalArgumentException("1회 제재는 경고만 가능합니다.");
        }

        // 1~4회 : 관리자가 선택한 제재 타입 그대로 처리
        UserStatus newStatus = switch (dto.sanctionType()) {
            case WARNING -> UserStatus.ACTIVE; // 경고는 상태 변경 없음
            case PERMANENT_BAN -> UserStatus.BANNED;
            case CONTENT_DELETE -> UserStatus.ACTIVE; // 콘텐츠 삭제만, 계정 유지
            default -> UserStatus.SUSPENDED; // BAN_1D, BAN_3D, BAN_30D
        };
        targetUser.changeUserStatus(newStatus);
    }

    // circle 제재 집행 메소드
    private void executeCircleSanction(SanctionRequestDTO dto) {
        Circle circle = adminCircleRepository.findById(dto.targetId())
                .orElseThrow(() -> new IllegalArgumentException("모임을 찾을 수 없습니다."));

        // 제재 횟수 증가
        circle.increaseSanctionCount();
        int count = circle.getSanctionCount();
        log.info("모임 제재 횟수 증가 circleId={}, sanctionCount={}", circle.getCircleId(), circle.getSanctionCount());

        if (count >= 3) {
            // 3회 -> 강제해산
            // 상태 변경 전에 활성 멤버들에게 알림 발송
            circleMemberRepository.findByCircleAndStatus(circle, CircleMemberStatus.ACTIVE)
                    .forEach(m -> notificationService.send(
                            m.getUser().getUserId(),
                            NotificationType.CIRCLE_DISBANDED,
                            "'" + circle.getName() + "' 모임이 해산되었습니다."));
            circle.setStatus(CircleStatus.CLOSED);
            log.info("제재 3회 누적 강제해산 circleId={}", circle.getCircleId());
        } else {
            // 1~2회 경고만
            log.info("모임 경고 {}회 circleId={}", count, circle.getCircleId());
        }
    }

    // 제재 수동 해제 메소드
    @Transactional
    public void liftSanction(Long sanctionId) {
        Sanction sanction = sanctionRepository.findById(sanctionId)
                .orElseThrow(() -> new IllegalArgumentException("제재 내역을 찾을 수 없습니다."));

        sanction.lift(); // 제재 해제

        // 활성중인 다른 제재가 없으면 유저 상태 복구
        if (sanction.getTargetType() == ReportTargetType.USER) {
            boolean hasOther = sanctionRepository.existsOtherActiveSanction(sanction.getTargetUser().getUserId(),
                    sanctionId);
            if (!hasOther) {
                sanction.getTargetUser().setUserStatus(UserStatus.ACTIVE);
            }
        }
    }

    // 제재 취소 (관리자 실수 등)
    @Transactional
    public void cancelSanction(Long sanctionId, Long adminId, String cancelReason) {
        Sanction sanction = sanctionRepository.findById(sanctionId)
                .orElseThrow(() -> new IllegalArgumentException("제재 내역을 찾을 수 없습니다."));

        if (sanction.getSanctionState() == SanctionState.CANCELLED) {
            throw new IllegalStateException("이미 취소된 제재입니다.");
        }

        Users admin = adminUsersRepository.findById(adminId)
                .orElseThrow(() -> new IllegalArgumentException("해당 관리자를 찾을 수 없습니다."));

        sanction.cancel(admin, cancelReason); // 취소 상태로 변경

        // 실제 복원
        rollbackSanction(sanction);
        log.info("[제재 취소] sanctionId={}, 취소관리자={}, 사유={}",
                sanctionId, admin.getNickname(), cancelReason);
    }

    // 제재 롤백하기
    private void rollbackSanction(Sanction sanction) {
        switch (sanction.getTargetType()) {
            // 유저는 개별 메소드로
            case USER:
                rollbackUserSanction(sanction);
                break;
            case POST:
                Post post = adminPostRepository.findById(sanction.getTargetId())
                        .orElseThrow(() -> new IllegalArgumentException("게시글을 찾을 수 없습니다."));
                post.restore();
                break;
            case REPLY:
                Reply reply = adminReplyRepository.findById(sanction.getTargetId())
                        .orElseThrow(() -> new IllegalArgumentException("댓글 찾을 수 없습니다."));
                reply.restore();
                break;
            case CIRCLE:
                rollbackCircleSanction(sanction);
                break;
        }
    }

    // 유저 제재 롤백 메소드
    private void rollbackUserSanction(Sanction sanction) {
        Users targetUser = sanction.getTargetUser();

        // 제재 횟수 감소
        targetUser.decreaseSanctionCount();
        log.info("[유저 제재 횟수 감소] userId={}, sanctionCount={}",
                targetUser.getUserId(), targetUser.getSanctionCount());

        switch (sanction.getSanctionType()) {

            case WARNING -> {
            }

            case BAN_1D, BAN_3D, BAN_30D, PERMANENT_BAN -> {
                boolean hasOther = sanctionRepository.existsOtherActiveSanction(
                        targetUser.getUserId(), sanction.getId());
                if (!hasOther) {
                    targetUser.changeUserStatus(UserStatus.ACTIVE);
                    log.info("[유저 상태 ACTIVE 복구] userId={}", targetUser.getUserId());
                }
            }

            case CONTENT_DELETE -> {
                // 집행 당시 유저 상태 변경 없었으므로 복구 없음
            }
        }
    }

    // 서클 경고 롤백 메소드
    private void rollbackCircleSanction(Sanction sanction) {
        Circle circle = adminCircleRepository.findById(sanction.getTargetId())
                .orElseThrow(() -> new IllegalArgumentException("모임을 찾을 수 없습니다."));

        // 제재 횟수 감소
        circle.decreaseSanctionCount();
        log.info("[모임 제재 횟수 감소] circleId={}, sanctionCount={}",
                circle.getCircleId(), circle.getSanctionCount());

        if (circle.getStatus() == CircleStatus.CLOSED) {
            circle.setStatus(CircleStatus.OPEN);
            log.info("[모임 강제해산 취소 → OPEN 복구] circleId={}", circle.getCircleId());
        }
    }

    // 특정 유저 제재 이력
    public List<SanctionResponseDTO> getUserSanctionHistory(Long userId) {
        return sanctionRepository.findByTargetUser_UserIdOrderByCreateDateDesc(userId)
                .stream().map(this::entityToDto)
                .toList();
    }

    // entity -> dto 변환 전용 메소드 (여러곳에서쓴다) - dry원칙(Dont Repeat Yourself)
    private SanctionResponseDTO entityToDto(Sanction s) {
        return SanctionResponseDTO.builder()
                .sanctionId(s.getId())
                .targetUserName(s.getTargetUser().getName())
                .adminName(s.getAdmin().getName())
                .targetType(s.getTargetType())
                .targetId(s.getTargetId())
                .sanctionType(s.getSanctionType())
                .sanctionState(s.getSanctionState())
                .reason(s.getReason())
                .startAt(s.getStartAt())
                .endAt(s.getEndAt())
                .cancelledByName(s.getCancelledBy() != null ? s.getCancelledBy().getName() : null)
                .cancelReason(s.getCancelReason())
                .cancelledAt(s.getCancelledAt())
                .build();

    }
}
