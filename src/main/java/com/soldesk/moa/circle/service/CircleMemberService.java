package com.soldesk.moa.circle.service;

import java.util.List;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.soldesk.moa.circle.dto.CircleMemberResponseDTO;
import com.soldesk.moa.circle.entity.Circle;
import com.soldesk.moa.circle.entity.CircleMember;
import com.soldesk.moa.circle.entity.constant.CircleMemberStatus;
import com.soldesk.moa.circle.entity.constant.CircleRole;
import com.soldesk.moa.circle.repository.CircleMemberRepository;
import com.soldesk.moa.circle.repository.CircleRepository;
import com.soldesk.moa.common.dto.PageRequestDTO;
import com.soldesk.moa.common.dto.PageResultDTO;
import com.soldesk.moa.users.entity.Users;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class CircleMemberService {

        private final CircleMemberRepository circleMemberRepository;
        private final CircleRepository circleRepository;

        @Transactional
        public void requestJoin(Long circleId, Users loginUser) {

                Circle circle = circleRepository.findById(circleId)
                                .orElseThrow(() -> new IllegalArgumentException("서클이 존재하지 않습니다."));

                // 1. 이미 가입 or 신청 여부 체크
                boolean exists = circleMemberRepository
                                .existsByCircleAndUserAndStatusIn(
                                                circle,
                                                loginUser,
                                                List.of(CircleMemberStatus.PENDING, CircleMemberStatus.ACTIVE));

                if (exists) {
                        throw new IllegalStateException("이미 가입했거나 가입 신청 중입니다.");
                }

                // 2. 정원 체크 (ACTIVE 기준)
                int activeCount = circleMemberRepository.countByCircleAndStatus(
                                circle,
                                CircleMemberStatus.ACTIVE);

                if (activeCount >= circle.getMaxMember()) {
                        throw new IllegalStateException("서클 정원이 가득 찼습니다.");
                }

                // 3. 가입 신청 (PENDING)
                CircleMember member = CircleMember.builder()
                                .circle(circle)
                                .user(loginUser)
                                .role(CircleRole.MEMBER)
                                .status(CircleMemberStatus.PENDING)
                                .build();

                circleMemberRepository.save(member);
        }

        @Transactional
        public void changeStatus(
                        Long circleId,
                        Long memberId,
                        CircleMemberStatus status,
                        Users loginUser) {

                // 멤버 조회 (서클 소속까지 검증)
                CircleMember member = circleMemberRepository
                                .findById(memberId)
                                .orElseThrow(() -> new IllegalArgumentException("멤버 없음"));

                if (!member.getCircle().getCircleId().equals(circleId)) {
                        throw new AccessDeniedException("서클이 일치하지 않습니다.");
                }

                // 리더 권한 체크
                circleMemberRepository
                                .findByCircleAndUserAndRole(
                                                member.getCircle(),
                                                loginUser,
                                                CircleRole.LEADER)
                                .orElseThrow(() -> new AccessDeniedException("리더만 가능"));

                // 상태 전이 검증
                if (member.getStatus() != CircleMemberStatus.PENDING) {
                        throw new IllegalStateException("대기 상태인 멤버만 처리할 수 있습니다.");
                }

                // 승인 처리
                if (status == CircleMemberStatus.ACTIVE) {

                        int activeCount = circleMemberRepository
                                        .countByCircleAndStatus(
                                                        member.getCircle(),
                                                        CircleMemberStatus.ACTIVE);

                        if (activeCount >= member.getCircle().getMaxMember()) {
                                throw new IllegalStateException("서클 정원이 가득 찼습니다.");
                        }

                        member.changeStatus(CircleMemberStatus.ACTIVE);
                        member.getCircle().increaseMember();
                        return;
                }

                // 거절 처리
                if (status == CircleMemberStatus.REJECTED) {
                        member.changeStatus(CircleMemberStatus.REJECTED);
                        return;
                }

                throw new IllegalArgumentException("잘못된 상태 변경 요청");
        }

        @Transactional(readOnly = true)
public PageResultDTO<CircleMemberResponseDTO> getMembers(
        Long circleId,
        CircleMemberStatus status,
        PageRequestDTO pageRequestDTO,
        Users loginUser
) {
    Circle circle = circleRepository.findById(circleId)
        .orElseThrow(() -> new IllegalArgumentException("서클 없음"));

    // 리더 체크
    circleMemberRepository
            .findByCircleAndUserAndRole(
                    circle,
                    loginUser,
                    CircleRole.LEADER
            )
            .orElseThrow(() -> new AccessDeniedException("리더만 조회 가능"));

    PageResultDTO<CircleMember> result =
            circleMemberRepository.findMembers(
                    circleId,
                    status,
                    pageRequestDTO
            );

    return PageResultDTO.<CircleMemberResponseDTO>withAll()
            .dtoList(
                    result.getDtoList().stream()
                            .map(CircleMemberResponseDTO::new)
                            .toList()
            )
            .pageRequestDTO(pageRequestDTO)
            .totalCount(result.getTotalCount())
            .build();
}


}
