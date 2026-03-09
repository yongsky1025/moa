package com.soldesk.moa.schedule.service;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.soldesk.moa.circle.entity.Circle;
import com.soldesk.moa.circle.entity.CircleMember;
import com.soldesk.moa.circle.entity.constant.CircleMemberStatus;
import com.soldesk.moa.circle.repository.CircleMemberRepository;
import com.soldesk.moa.circle.repository.CircleRepository;
import com.soldesk.moa.schedule.dto.ScheduleCreateRequestDTO;
import com.soldesk.moa.schedule.dto.ScheduleResponseDTO;
import com.soldesk.moa.schedule.entity.Schedule;
import com.soldesk.moa.schedule.entity.ScheduleMember;
import com.soldesk.moa.schedule.entity.constant.ScheduleMemberStatus;
import com.soldesk.moa.schedule.repository.ScheduleMemberRepository;
import com.soldesk.moa.schedule.repository.ScheduleRepository;
import com.soldesk.moa.users.entity.Users;
import com.soldesk.moa.users.repository.UsersRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class ScheduleService {

        private final ScheduleRepository scheduleRepository;
        private final ScheduleMemberRepository scheduleMemberRepository;
        private final CircleRepository circleRepository;
        private final CircleMemberRepository circleMemberRepository;
        private final UsersRepository usersRepository;

        public ScheduleResponseDTO createSchedule(
                        Long circleId,
                        ScheduleCreateRequestDTO request,
                        Long userId) {

                Users loginUser = usersRepository.findById(userId)
                                .orElseThrow(() -> new IllegalArgumentException("사용자가 존재하지 않습니다."));

                // 서클 존재 여부
                Circle circle = circleRepository.findById(circleId)
                                .orElseThrow(() -> new IllegalArgumentException("서클이 존재하지 않습니다."));

                // 서클 가입 여부 (ACTIVE)
                CircleMember creator = circleMemberRepository
                                .findByCircleAndUser_UserIdAndStatus(
                                                circle,
                                                loginUser.getUserId(),
                                                CircleMemberStatus.ACTIVE)
                                .orElseThrow(() -> new AccessDeniedException("서클 멤버만 일정 생성 가능"));

                // 날짜 검증
                if (request.getEndAt().isBefore(request.getStartAt())) {
                        throw new IllegalArgumentException("종료 날짜는 시작 날짜 이후여야 합니다.");
                }

                // 일정 생성
                Schedule schedule = Schedule.builder()
                                .title(request.getTitle())
                                .description(request.getDescription())
                                .startAt(request.getStartAt())
                                .endAt(request.getEndAt())
                                .maxMember(request.getMaxMember())
                                .creator(creator)
                                .circle(circle)
                                .address(request.getLocation())
                                .latitude(request.getLatitude())
                                .longitude(request.getLongitude())
                                .build();

                Schedule saved = scheduleRepository.save(schedule);

                ScheduleMember creatorMember = ScheduleMember.builder()
                                .schedule(saved)
                                .circleMember(creator)
                                .status(ScheduleMemberStatus.JOIN)
                                .build();

                scheduleMemberRepository.save(creatorMember);

                return new ScheduleResponseDTO(saved);
        }

        @Transactional
        public void joinSchedule(
                        Long scheduleId,
                        Long userId) {

                Users loginUser = usersRepository.findById(userId)
                                .orElseThrow(() -> new IllegalArgumentException("사용자가 존재하지 않습니다."));

                // 1. 일정 조회
                Schedule schedule = scheduleRepository.findById(scheduleId)
                                .orElseThrow(() -> new IllegalArgumentException("일정이 존재하지 않습니다."));

                // 2. 서클 ACTIVE 멤버인지 확인
                CircleMember member = circleMemberRepository
                                .findByCircleAndUser_UserIdAndStatus(
                                                schedule.getCircle(),
                                                loginUser.getUserId(),
                                                CircleMemberStatus.ACTIVE)
                                .orElseThrow(() -> new AccessDeniedException("서클 멤버만 참여 가능합니다."));

                // 3. 이미 참여했는지 확인
                if (scheduleMemberRepository
                                .existsByScheduleAndCircleMember(schedule, member)) {
                        throw new IllegalStateException("이미 일정에 참여 중입니다.");
                }

                // 4. 정원 초과 검증
                if (schedule.getCurrentMember() >= schedule.getMaxMember()) {
                        throw new IllegalStateException("정원이 초과되었습니다.");
                }

                // 5. ScheduleMember 생성
                ScheduleMember scheduleMember = ScheduleMember.builder()
                                .schedule(schedule)
                                .circleMember(member)
                                .status(ScheduleMemberStatus.JOIN)
                                .build();

                scheduleMemberRepository.save(scheduleMember);

                // 6. 현재 인원 증가
                schedule.increaseCurrentMember();
        }
}