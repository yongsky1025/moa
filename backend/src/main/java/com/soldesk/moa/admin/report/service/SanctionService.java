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
import com.soldesk.moa.circle.entity.constant.CircleStatus;
import com.soldesk.moa.common.dto.PageResultDTO;
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

            case CIRCLE -> adminCircleRepository.findById(dto.targetId())
                    .orElseThrow(() -> new IllegalArgumentException("모임을 찾을 수 없습니다."))
                    .setStatus(CircleStatus.SUSPENDED);

        }
    };

    // 타입 user용 제재 실행메소드
    private void executeUserSanction(SanctionRequestDTO dto, Users targetUser, Users admin) {
        if (dto.sanctionType() == SanctionType.WARNING) {

            // 경고 횟수 1 증가
            targetUser.increaseWarningCount();
            int count = targetUser.getWarningCount();

            // 경고 누적 계산
            SanctionType autoType = SanctionType.getAutoSanctionByWarningCount(count);

            // 2회이상이면 제재
            if (autoType != SanctionType.WARNING) {
                sanctionRepository.save(
                        Sanction.builder()
                                .report(null)
                                .targetUser(targetUser)
                                .admin(admin)
                                .targetType(ReportTargetType.USER)
                                .targetId(targetUser.getUserId())
                                .sanctionType(autoType)
                                .reason("경고 " + count + "회 누적으로 인한 자동 제재")
                                .startAt(LocalDateTime.now())
                                .endAt(calculateEndAt(autoType))
                                .build());

                // 유저 상태 변경
                UserStatus newStatus = autoType == SanctionType.PERMANENT_BAN
                        ? UserStatus.BANNED
                        : UserStatus.SUSPENDED;
                targetUser.setUserStatus(newStatus);

                log.info("경고 누적 자동 제재 userID={}, count={}, type={}",
                        targetUser.getUserId(), count, autoType);
            } else {
                // 경고만
                log.info("[경고] userId={}, warnigCount={}", targetUser.getUserId(), count);
            }
        } else {
            // 경고 외 제재(1일정지 이상의 것들)
            UserStatus newStatus = switch (dto.sanctionType()) {
                case PERMANENT_BAN -> UserStatus.BANNED;
                case CONTENT_DELETE -> UserStatus.ACTIVE; // 컨텐츠(게시글/댓글) 삭제만
                default -> UserStatus.SUSPENDED;
            };
            targetUser.setUserStatus(newStatus);
        }
    }

    // 제재 정상 해제
    @Transactional
    public void liftSanction(Long sanctionId) {
        Sanction sanction = sanctionRepository.findById(sanctionId)
                .orElseThrow(() -> new IllegalArgumentException("제재 내역을 찾을 수 없습니다."));

        sanction.lift(); // 제재 해제

        // 활성중인 다른 제재가 없으면 유저 상태 복구
        boolean hasOther = sanctionRepository.existsOtherActiveSanction(sanction.getTargetUser().getUserId(),
                sanctionId);
        if (!hasOther) {
            sanction.getTargetUser().setUserStatus(UserStatus.ACTIVE);
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
                Circle circle = adminCircleRepository.findById(sanction.getTargetId())
                        .orElseThrow(() -> new IllegalArgumentException("모임을 찾을 수 없습니다."));
                circle.setStatus(CircleStatus.OPEN);
                break;
        }
    }

    // 유저 제재 롤백 메소드
    private void rollbackUserSanction(Sanction sanction) {
        Users targetUser = sanction.getTargetUser();

        switch (sanction.getSanctionType()) {
            case WARNING:
                targetUser.decreaseWarningCount();

                // 해당 경고로 자동 생성된 제재 연쇄 취소
                sanctionRepository
                        .findAutoSanctionByWarning(targetUser.getUserId(), SanctionState.ACTIVE,
                                sanction.getCreateDate())
                        .ifPresent(autoSanction -> {
                            autoSanction.cancel(sanction.getCancelledBy(), "경고 취소로 인한 자동 취소");
                            targetUser.changeUserStatus(UserStatus.ACTIVE);
                            log.info("자동 제재 연쇄 취소 sanctionId={}", autoSanction.getId());
                        });
                break;
            case BAN_1D, BAN_3D, BAN_30D, PERMANENT_BAN:
                // 다른 제재 없을 때만 복구
                boolean hasOther = sanctionRepository.existsOtherActiveSanction(targetUser.getUserId(),
                        sanction.getId());
                if (!hasOther) {
                    targetUser.changeUserStatus(UserStatus.ACTIVE);
                    log.info("유저 상태 복구 userId={}", targetUser.getUserId());
                }
                break;
            case CONTENT_DELETE:
                break;
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
