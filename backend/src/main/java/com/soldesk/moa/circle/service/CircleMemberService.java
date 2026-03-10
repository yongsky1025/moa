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
import com.soldesk.moa.users.repository.UsersRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class CircleMemberService {

        private final CircleMemberRepository circleMemberRepository;
        private final CircleRepository circleRepository;
        private final UsersRepository usersRepository;

        // 서클 가입 신청
        @Transactional
        public void requestJoin(Long circleId, Long userId) {

                Users loginUser = usersRepository.findById(userId)
                                .orElseThrow(() -> new IllegalArgumentException("사용자가 존재하지 않습니다."));

                Circle circle = circleRepository.findById(circleId)
                                .orElseThrow(() -> new IllegalArgumentException("서클이 존재하지 않습니다."));

                // 이미 가입 or 신청 여부 체크
                boolean exists = circleMemberRepository
                                .existsByCircleAndUserAndStatusIn(
                                                circle,
                                                loginUser,
                                                List.of(CircleMemberStatus.PENDING, CircleMemberStatus.ACTIVE));

                if (exists) {
                        throw new IllegalStateException("이미 가입했거나 가입 신청 중입니다.");
                }

                // 정원 체크 (ACTIVE 기준)
                int activeCount = circleMemberRepository.countByCircleAndStatus(
                                circle,
                                CircleMemberStatus.ACTIVE);

                if (activeCount >= circle.getMaxMember()) {
                        throw new IllegalStateException("서클 정원이 가득 찼습니다.");
                }

                // 가입 신청 (PENDING)
                CircleMember member = CircleMember.builder()
                                .circle(circle)
                                .user(loginUser)
                                .role(CircleRole.MEMBER)
                                .status(CircleMemberStatus.PENDING)
                                .build();

                circleMemberRepository.save(member);
        }

        // 멤버 상태 변경 (가입 대기중 => 승인 or 거절)
        @Transactional
        public void changeStatus(
                        Long circleId,
                        Long memberId,
                        CircleMemberStatus status,
                        Long userId) {

                Users loginUser = usersRepository.findById(userId)
                                .orElseThrow(() -> new IllegalArgumentException("사용자가 존재하지 않습니다."));

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

                // 상태 검증
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

        // 리더 전용 서클 멤버 조회
        // 유저 정보 조회시 유저의 개인정보가 전부 보이는 문제.
        @Transactional(readOnly = true)
        public PageResultDTO<CircleMemberResponseDTO> getMembers(
                        Long circleId,
                        CircleMemberStatus status,
                        PageRequestDTO pageRequestDTO,
                        Long userId) {

                Users loginUser = usersRepository.findById(userId)
                                .orElseThrow(() -> new IllegalArgumentException("사용자가 존재하지 않습니다."));
                Circle circle = circleRepository.findById(circleId)
                                .orElseThrow(() -> new IllegalArgumentException("서클 없음"));

                // 리더 체크
                circleMemberRepository
                                .findByCircleAndUserAndRole(
                                                circle,
                                                loginUser,
                                                CircleRole.LEADER)
                                .orElseThrow(() -> new AccessDeniedException("리더만 조회 가능"));

                PageResultDTO<CircleMember> result = circleMemberRepository.findMembers(
                                circleId,
                                status,
                                pageRequestDTO);

                return PageResultDTO.<CircleMemberResponseDTO>withAll()
                                .dtoList(
                                                result.getDtoList().stream()
                                                                .map(CircleMemberResponseDTO::from)
                                                                .toList())
                                .pageRequestDTO(pageRequestDTO)
                                .totalCount(result.getTotalCount())
                                .build();
        }

        // ACTIVE 멤버 조회 전용
        @Transactional(readOnly = true)
        public PageResultDTO<CircleMemberResponseDTO> getActiveMembers(
                        Long circleId,
                        PageRequestDTO pageRequestDTO) {

                // 서클 존재 여부만 체크
                circleRepository.findById(circleId)
                                .orElseThrow(() -> new IllegalArgumentException("서클 없음"));

                PageResultDTO<CircleMember> result = circleMemberRepository.findActiveMembers(
                                circleId,
                                pageRequestDTO);

                return PageResultDTO.<CircleMemberResponseDTO>withAll()
                                .dtoList(
                                                result.getDtoList().stream()
                                                                .map(CircleMemberResponseDTO::from)
                                                                .toList())
                                .pageRequestDTO(pageRequestDTO)
                                .totalCount(result.getTotalCount())
                                .build();
        }

        // 서클 탈퇴
        public void leaveCircle(Long circleId, Long userId) {
                Circle circle = circleRepository.findById(circleId)
                                .orElseThrow(() -> new IllegalArgumentException("서클이 존재하지 않습니다."));

                // ACTIVE 멤버만 탈퇴 가능
                CircleMember member = circleMemberRepository
                                .findByCircleAndUser_UserIdAndStatus(
                                                circle,
                                                userId,
                                                CircleMemberStatus.ACTIVE)
                                .orElseThrow(() -> new IllegalStateException("가입된 멤버만 탈퇴할 수 있습니다."));

                // 리더 탈퇴 방지
                if (member.getRole() == CircleRole.LEADER) {
                        throw new IllegalStateException("리더는 탈퇴할 수 없습니다. 리더를 위임하세요.");
                }

                member.changeStatus(CircleMemberStatus.LEFT);
                circle.decreaseMember();
        }

        // 리더 권한 위임
        @Transactional
        public void delegateLeader(
                        Long circleId,
                        Long targetMemberId,
                        Long userId) {

                Circle circle = circleRepository.findById(circleId)
                                .orElseThrow(() -> new IllegalArgumentException("서클이 존재하지 않습니다."));

                // 현재 로그인 유저 (리더)
                CircleMember leader = circleMemberRepository
                                .findByCircleAndUserAndRole(
                                                circle,
                                                usersRepository.findById(userId)
                                                                .orElseThrow(() -> new IllegalArgumentException(
                                                                                "사용자 없음")),
                                                CircleRole.LEADER)
                                .orElseThrow(() -> new AccessDeniedException("리더만 권한을 위임할 수 있습니다."));

                // 위임 대상 (ACTIVE 멤버)
                CircleMember target = circleMemberRepository.findById(targetMemberId)
                                .orElseThrow(() -> new IllegalArgumentException("위임 대상 멤버가 없습니다."));

                // 같은 서클인지 검증
                if (!target.getCircle().getCircleId().equals(circleId)) {
                        throw new IllegalArgumentException("같은 서클의 멤버만 위임할 수 있습니다.");
                }

                // ACTIVE 멤버만 가능
                if (target.getStatus() != CircleMemberStatus.ACTIVE) {
                        throw new IllegalStateException("활동 중인 멤버에게만 리더를 위임할 수 있습니다.");
                }

                // 역할 변경
                leader.changeRole(CircleRole.MEMBER);
                target.changeRole(CircleRole.LEADER);
        }

}
