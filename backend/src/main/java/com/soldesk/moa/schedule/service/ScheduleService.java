package com.soldesk.moa.schedule.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.soldesk.moa.circle.entity.Circle;
import com.soldesk.moa.circle.entity.CircleMember;
import com.soldesk.moa.circle.entity.constant.CircleMemberStatus;
import com.soldesk.moa.circle.entity.constant.CircleRole;
import com.soldesk.moa.circle.repository.CircleMemberRepository;
import com.soldesk.moa.circle.repository.CircleRepository;
import com.soldesk.moa.schedule.dto.ScheduleCreateRequestDTO;
import com.soldesk.moa.schedule.dto.ScheduleResponseDTO;
import com.soldesk.moa.schedule.dto.ScheduleUpdateRequestDTO;
import com.soldesk.moa.schedule.entity.Schedule;
import com.soldesk.moa.schedule.entity.ScheduleMember;
import com.soldesk.moa.schedule.entity.constant.ScheduleMemberStatus;
import com.soldesk.moa.schedule.repository.ScheduleMemberRepository;
import com.soldesk.moa.schedule.repository.ScheduleRepository;
import com.soldesk.moa.chat.service.ChatRoomService;
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
        private final ChatRoomService chatRoomService;

        // 일정 생성
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
                saved.increaseCurrentMember();

                Long chatRoomId = chatRoomService
                                .getOrCreateScheduleRoom(saved.getScheduleId(), saved.getTitle(), userId)
                                .getId();

                return new ScheduleResponseDTO(saved, chatRoomId);
        }

        // 일정 참여
        @Transactional
        public void joinSchedule(
                        Long scheduleId,
                        Long userId) {

                Users loginUser = usersRepository.findById(userId)
                                .orElseThrow(() -> new IllegalArgumentException("사용자가 존재하지 않습니다."));

                // 일정 조회
                Schedule schedule = scheduleRepository.findById(scheduleId)
                                .orElseThrow(() -> new IllegalArgumentException("일정이 존재하지 않습니다."));

                // 서클 ACTIVE 멤버인지 확인
                CircleMember member = circleMemberRepository
                                .findByCircleAndUser_UserIdAndStatus(schedule.getCircle(), loginUser.getUserId(),
                                                CircleMemberStatus.ACTIVE)
                                .orElseThrow(() -> new AccessDeniedException("서클 멤버만 참여 가능합니다."));

                // 일정 시작 24시간 전까지만 참여 가능
                if (LocalDateTime.now().isAfter(schedule.getStartAt().minusDays(1))) {
                        throw new IllegalStateException("일정 시작 24시간 전까지만 참여할 수 있습니다.");
                }

                // 이미 참여했는지 확인
                if (scheduleMemberRepository
                                .existsByScheduleAndCircleMember(schedule, member)) {
                        throw new IllegalStateException("이미 일정에 참여 중입니다.");
                }

                // 정원 초과 검증
                if (schedule.getCurrentMember() >= schedule.getMaxMember()) {
                        throw new IllegalStateException("정원이 초과되었습니다.");
                }

                // ScheduleMember 생성
                ScheduleMember scheduleMember = ScheduleMember.builder()
                                .schedule(schedule)
                                .circleMember(member)
                                .status(ScheduleMemberStatus.JOIN)
                                .build();

                scheduleMemberRepository.save(scheduleMember);

                // 현재 인원 증가
                schedule.increaseCurrentMember();
        }

        // 일정 삭제 (일정 생성자 혹은 서클 리더면 삭제 가능)
        @Transactional
        public void deleteSchedule(
                        Long circleId,
                        Long scheduleId,
                        Long userId) {

                Schedule schedule = scheduleRepository.findById(scheduleId)
                                .orElseThrow(() -> new IllegalArgumentException("일정이 존재하지 않습니다."));

                Circle circle = schedule.getCircle();

                // 서클 검증
                if (!schedule.getCircle().getCircleId().equals(circleId)) {
                        throw new AccessDeniedException("서클이 일치하지 않습니다.");
                }

                // 일정 생성자 검증
                boolean isCreator = schedule.getCreator().getUser().getUserId().equals(userId);

                // 서클 리더인지 확인
                boolean isLeader = circleMemberRepository
                                .findByCircleAndUserAndRole(circle,
                                                usersRepository.findById(userId)
                                                                .orElseThrow(() -> new IllegalArgumentException(
                                                                                "사용자 없음")),
                                                CircleRole.LEADER)
                                .isPresent();

                // 권한 체크
                if (!isCreator && !isLeader) {
                        throw new AccessDeniedException("일정 생성자 또는 서클 리더만 삭제할 수 있습니다.");
                }

                // 일정 참여자 삭제
                scheduleMemberRepository.deleteAllBySchedule(schedule);
                // 일정 삭제
                scheduleRepository.delete(schedule);
        }

        // 서클 일정 목록 조회 (서클 ACTIVE 멤버만)
        @Transactional(readOnly = true)
        public List<ScheduleResponseDTO> getSchedules(Long circleId, Long userId) {

                Circle circle = circleRepository.findById(circleId)
                                .orElseThrow(() -> new IllegalArgumentException("서클이 존재하지 않습니다."));

                circleMemberRepository
                                .findByCircleAndUser_UserIdAndStatus(circle, userId, CircleMemberStatus.ACTIVE)
                                .orElseThrow(() -> new AccessDeniedException("서클 멤버만 일정을 조회할 수 있습니다."));

                return scheduleRepository.findByCircle_CircleId(circleId)
                                .stream()
                                .map(ScheduleResponseDTO::new)
                                .toList();
        }

        // 일정 상세 조회 (서클 ACTIVE 멤버만)
        @Transactional(readOnly = true)
        public ScheduleResponseDTO getSchedule(Long circleId, Long scheduleId, Long userId) {

                Circle circle = circleRepository.findById(circleId)
                                .orElseThrow(() -> new IllegalArgumentException("서클이 존재하지 않습니다."));

                CircleMember circleMember = circleMemberRepository
                                .findByCircleAndUser_UserIdAndStatus(circle, userId, CircleMemberStatus.ACTIVE)
                                .orElseThrow(() -> new AccessDeniedException("서클 멤버만 일정을 조회할 수 있습니다."));

                Schedule schedule = scheduleRepository.findById(scheduleId)
                                .orElseThrow(() -> new IllegalArgumentException("일정이 존재하지 않습니다."));

                if (!schedule.getCircle().getCircleId().equals(circleId)) {
                        throw new IllegalArgumentException("해당 서클의 일정이 아닙니다.");
                }

                boolean joined = scheduleMemberRepository.existsByScheduleAndCircleMember(schedule, circleMember);
                return new ScheduleResponseDTO(schedule, joined);
        }

        // 일정 수정 (생성자 또는 서클 리더)
        @Transactional
        public ScheduleResponseDTO updateSchedule(
                        Long circleId,
                        Long scheduleId,
                        ScheduleUpdateRequestDTO request,
                        Long userId) {

                Schedule schedule = scheduleRepository.findById(scheduleId)
                                .orElseThrow(() -> new IllegalArgumentException("일정이 존재하지 않습니다."));

                if (!schedule.getCircle().getCircleId().equals(circleId)) {
                        throw new IllegalArgumentException("해당 서클의 일정이 아닙니다.");
                }

                boolean isCreator = schedule.getCreator().getUser().getUserId().equals(userId);
                boolean isLeader = circleMemberRepository
                                .findByCircleAndUserAndRole(
                                                schedule.getCircle(),
                                                usersRepository.findById(userId)
                                                                .orElseThrow(() -> new IllegalArgumentException("사용자가 존재하지 않습니다.")),
                                                CircleRole.LEADER)
                                .isPresent();

                if (!isCreator && !isLeader) {
                        throw new AccessDeniedException("일정 생성자 또는 서클 리더만 수정할 수 있습니다.");
                }

                if (request.getEndAt().isBefore(request.getStartAt())) {
                        throw new IllegalArgumentException("종료 날짜는 시작 날짜 이후여야 합니다.");
                }

                if (request.getMaxMember() < schedule.getCurrentMember()) {
                        throw new IllegalArgumentException("최대 인원은 현재 참여 인원보다 적을 수 없습니다.");
                }

                Schedule updated = Schedule.builder()
                                .scheduleId(schedule.getScheduleId())
                                .title(request.getTitle())
                                .description(request.getDescription())
                                .startAt(request.getStartAt())
                                .endAt(request.getEndAt())
                                .maxMember(request.getMaxMember())
                                .currentMember(schedule.getCurrentMember())
                                .creator(schedule.getCreator())
                                .circle(schedule.getCircle())
                                .address(request.getLocation())
                                .latitude(request.getLatitude())
                                .longitude(request.getLongitude())
                                .build();

                return new ScheduleResponseDTO(scheduleRepository.save(updated));
        }

        // 일정 참여 취소 (일정 시작일 하루 전까지만 참여 취소가능)
        @Transactional
        public void cancelSchedule(
                        Long scheduleId,
                        Long userId) {

                Users loginUser = usersRepository.findById(userId)
                                .orElseThrow(() -> new IllegalArgumentException("사용자가 존재하지 않습니다."));

                Schedule schedule = scheduleRepository.findById(scheduleId)
                                .orElseThrow(() -> new IllegalArgumentException("일정이 존재하지 않습니다."));

                // 취소 가능 시간 검증 (일정 시작일 하루 전까지만)
                LocalDateTime now = LocalDateTime.now();
                if (now.isAfter(schedule.getStartAt().minusDays(1))) {
                        throw new IllegalStateException("일정 시작 24시간 전까지만 취소할 수 있습니다.");
                }

                // 서클 ACTIVE 멤버인지 확인
                CircleMember member = circleMemberRepository
                                .findByCircleAndUser_UserIdAndStatus(
                                                schedule.getCircle(),
                                                loginUser.getUserId(),
                                                CircleMemberStatus.ACTIVE)
                                .orElseThrow(() -> new AccessDeniedException("서클 멤버만 가능합니다."));

                // 참여 여부 확인
                ScheduleMember scheduleMember = scheduleMemberRepository
                                .findByScheduleAndCircleMember(schedule, member)
                                .orElseThrow(() -> new IllegalStateException("참여하지 않은 일정입니다."));

                // 생성자는 참여 취소 불가 (일정 삭제 사용)
                if (schedule.getCreator().equals(member)) {
                        throw new IllegalStateException("일정 생성자는 참여를 취소할 수 없습니다. 일정을 삭제해 주세요.");
                }

                // 참여 기록 삭제
                scheduleMemberRepository.delete(scheduleMember);

                // 현재 인원 감소
                schedule.decreaseCurrentMember();
        }
}