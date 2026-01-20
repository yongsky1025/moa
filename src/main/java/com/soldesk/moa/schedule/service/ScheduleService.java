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

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class ScheduleService {

    private final ScheduleRepository scheduleRepository;
    private final ScheduleMemberRepository scheduleMemberRepository;
    private final CircleRepository circleRepository;
    private final CircleMemberRepository circleMemberRepository;

    public ScheduleResponseDTO createSchedule(
            Long circleId,
            ScheduleCreateRequestDTO request,
            Users loginUser) {

        // 서클 존재 여부
        Circle circle = circleRepository.findById(circleId)
                .orElseThrow(() -> new IllegalArgumentException("서클이 존재하지 않습니다."));

        // 서클 가입 여부 (ACTIVE)
        CircleMember creator = circleMemberRepository
                .findByCircleAndUserAndStatus(
                        circle,
                        loginUser,
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
}