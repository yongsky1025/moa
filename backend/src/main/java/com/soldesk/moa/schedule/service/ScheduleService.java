package com.soldesk.moa.schedule.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.soldesk.moa.circle.entity.Circle;
import com.soldesk.moa.circle.entity.CircleMember;
import com.soldesk.moa.circle.entity.constant.CircleMemberStatus;
import com.soldesk.moa.circle.entity.constant.CircleRole;
import com.soldesk.moa.circle.repository.CircleMemberRepository;
import com.soldesk.moa.circle.repository.CircleRepository;
import com.soldesk.moa.payment.dto.MyUpcomingScheduleDTO;
import com.soldesk.moa.place.dto.TagResponseDTO;
import com.soldesk.moa.place.entity.Tag;
import com.soldesk.moa.place.repository.ReservationRepository;
import com.soldesk.moa.place.repository.TagRepository;
import com.soldesk.moa.schedule.dto.ScheduleCreateRequestDTO;
import com.soldesk.moa.schedule.dto.ScheduleMemberResponseDTO;
import com.soldesk.moa.schedule.dto.ScheduleReservationDTO;
import com.soldesk.moa.schedule.dto.ScheduleResponseDTO;
import com.soldesk.moa.schedule.dto.ScheduleUpdateRequestDTO;
import com.soldesk.moa.schedule.entity.Schedule;
import com.soldesk.moa.schedule.entity.ScheduleMember;
import com.soldesk.moa.schedule.entity.ScheduleTag;
import com.soldesk.moa.schedule.entity.constant.ScheduleMemberStatus;
import com.soldesk.moa.schedule.repository.ScheduleMemberRepository;
import com.soldesk.moa.schedule.repository.ScheduleRepository;
import com.soldesk.moa.schedule.repository.ScheduleReviewRepository;
import com.soldesk.moa.chat.service.ChatRoomService;
import com.soldesk.moa.schedule.repository.ScheduleTagRepository;
import com.soldesk.moa.users.entity.Users;
import com.soldesk.moa.users.repository.UsersRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class ScheduleService {

        private final ScheduleRepository scheduleRepository;
        private final ScheduleMemberRepository scheduleMemberRepository;
        private final ScheduleTagRepository scheduleTagRepository;
        private final ScheduleReviewRepository scheduleReviewRepository;
        private final CircleRepository circleRepository;
        private final CircleMemberRepository circleMemberRepository;
        private final UsersRepository usersRepository;
        private final TagRepository tagRepository;
        private final ReservationRepository reservationRepository;
        private final ChatRoomService chatRoomService;
        private final com.soldesk.moa.payment.service.PaymentService paymentService;

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

                List<TagResponseDTO> savedTags = saveTags(saved, request.getTagIds());
                Long chatRoomId = chatRoomService
                                .getOrCreateScheduleRoom(saved.getScheduleId(), saved.getTitle(), userId)
                                .getId();
                return new ScheduleResponseDTO(saved, false, savedTags, chatRoomId);
        }

        // 일정 참여 (반환값: JOIN = 즉시 참여, PENDING = 승인 대기)
        @Transactional
        public ScheduleMemberStatus joinSchedule(
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

                // 기존 참여 기록 조회 (JOIN / PENDING / CANCELLED)
                java.util.Optional<ScheduleMember> existingRecord =
                                scheduleMemberRepository.findByScheduleAndCircleMember(schedule, member);

                if (existingRecord.isPresent()) {
                        ScheduleMemberStatus existingStatus = existingRecord.get().getStatus();
                        if (existingStatus == ScheduleMemberStatus.JOIN) {
                                throw new IllegalStateException("이미 일정에 참여 중입니다.");
                        }
                        if (existingStatus == ScheduleMemberStatus.PENDING) {
                                throw new IllegalStateException("이미 승인 대기 중입니다.");
                        }
                        // CANCELLED → 재참여 시 생성자 승인 필요
                        existingRecord.get().requestApproval();
                        return ScheduleMemberStatus.PENDING;
                }

                // 첫 참여: 정원 초과 검증 후 JOIN
                if (schedule.getCurrentMember() >= schedule.getMaxMember()) {
                        throw new IllegalStateException("정원이 초과되었습니다.");
                }

                ScheduleMember scheduleMember = ScheduleMember.builder()
                                .schedule(schedule)
                                .circleMember(member)
                                .status(ScheduleMemberStatus.JOIN)
                                .build();

                scheduleMemberRepository.save(scheduleMember);
                schedule.increaseCurrentMember();
                return ScheduleMemberStatus.JOIN;
        }

        // 일정 삭제 (일정 생성자 혹은 서클 리더면 삭제 가능)
        @Transactional
        public void deleteSchedule(
                        Long circleId,
                        Long scheduleId,
                        Long userId,
                        boolean cancelReservation) {

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

                // 생성자가 삭제할 경우: 본인만 참여 중이어야 함 (서클 리더는 제한 없음)
                if (isCreator && !isLeader) {
                        long joinCount = scheduleMemberRepository.countByScheduleAndStatus(schedule, ScheduleMemberStatus.JOIN);
                        if (joinCount > 1) {
                                throw new IllegalStateException("다른 참여자가 있습니다. 생성자를 위임한 후 참여를 취소해 주세요.");
                        }
                }

                // 연결된 활성 예약 처리
                if (cancelReservation) {
                        paymentService.cancelReservationsForSchedule(scheduleId);
                } else {
                        paymentService.detachReservationsFromSchedule(scheduleId);
                }

                // 일정 후기 삭제
                scheduleReviewRepository.deleteAllBySchedule(schedule);
                // 일정 참여자 삭제
                scheduleMemberRepository.deleteAllBySchedule(schedule);
                // 일정 삭제
                scheduleRepository.delete(schedule);
        }

        // 서클 일정 목록 조회 (서클 ACTIVE 멤버만, 날짜 범위 필터 선택적)
        @Transactional(readOnly = true)
        public List<ScheduleResponseDTO> getSchedules(
                        Long circleId,
                        Long userId,
                        LocalDateTime from,
                        LocalDateTime to) {

                Circle circle = circleRepository.findById(circleId)
                                .orElseThrow(() -> new IllegalArgumentException("서클이 존재하지 않습니다."));

                circleMemberRepository
                                .findByCircleAndUser_UserIdAndStatus(circle, userId, CircleMemberStatus.ACTIVE)
                                .orElseThrow(() -> new AccessDeniedException("서클 멤버만 일정을 조회할 수 있습니다."));

                List<Schedule> schedules = scheduleRepository.findByCircleWithDateFilter(circleId, from, to);
                if (schedules.isEmpty()) return List.of();

                // 태그 일괄 조회 (1 query) — 일정별 N회 호출 방지
                Map<Long, List<TagResponseDTO>> tagMap = scheduleTagRepository
                                .findAllByScheduleIn(schedules)
                                .stream()
                                .collect(Collectors.groupingBy(
                                                st -> st.getSchedule().getScheduleId(),
                                                Collectors.mapping(
                                                                st -> TagResponseDTO.builder()
                                                                                .id(st.getTag().getId())
                                                                                .name(st.getTag().getName())
                                                                                .build(),
                                                                Collectors.toList())));

                return schedules.stream()
                                .map(s -> new ScheduleResponseDTO(s, false,
                                                tagMap.getOrDefault(s.getScheduleId(), List.of())))
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

                java.util.Optional<ScheduleMember> currentMemberRecord =
                                scheduleMemberRepository.findByScheduleAndCircleMember(schedule, circleMember);

                boolean joined = currentMemberRecord
                                .map(sm -> sm.getStatus() == ScheduleMemberStatus.JOIN)
                                .orElse(false);
                boolean isPending = currentMemberRecord
                                .map(sm -> sm.getStatus() == ScheduleMemberStatus.PENDING)
                                .orElse(false);

                boolean isCreator = schedule.getCreator().getId().equals(circleMember.getId());

                int pendingCount = isCreator
                                ? (int) scheduleMemberRepository.countByScheduleAndStatus(schedule, ScheduleMemberStatus.PENDING)
                                : 0;

                List<TagResponseDTO> tags = scheduleTagRepository.findAllBySchedule(schedule).stream()
                                .map(st -> TagResponseDTO.builder()
                                                .id(st.getTag().getId())
                                                .name(st.getTag().getName())
                                                .build())
                                .toList();

                ScheduleReservationDTO reservationDTO = reservationRepository
                                .findActiveByScheduleIdWithPlace(scheduleId)
                                .stream()
                                .findFirst()
                                .map(ScheduleReservationDTO::new)
                                .orElse(null);

                return new ScheduleResponseDTO(schedule, joined, isPending, isCreator, pendingCount, tags, reservationDTO);
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
                                                                .orElseThrow(() -> new IllegalArgumentException(
                                                                                "사용자가 존재하지 않습니다.")),
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

                Schedule savedUpdated = scheduleRepository.save(updated);
                scheduleTagRepository.deleteAllBySchedule(savedUpdated);
                List<TagResponseDTO> updatedTags = saveTags(savedUpdated, request.getTagIds());
                return new ScheduleResponseDTO(savedUpdated, false, updatedTags);
        }

        // 일정 참여자 목록 조회 (JOIN 상태만, 서클 ACTIVE 멤버만)
        @Transactional(readOnly = true)
        public List<ScheduleMemberResponseDTO> getScheduleMembers(Long circleId, Long scheduleId, Long userId) {

                Circle circle = circleRepository.findById(circleId)
                                .orElseThrow(() -> new IllegalArgumentException("서클이 존재하지 않습니다."));

                circleMemberRepository
                                .findByCircleAndUser_UserIdAndStatus(circle, userId, CircleMemberStatus.ACTIVE)
                                .orElseThrow(() -> new AccessDeniedException("서클 멤버만 참여자 목록을 조회할 수 있습니다."));

                Schedule schedule = scheduleRepository.findById(scheduleId)
                                .orElseThrow(() -> new IllegalArgumentException("일정이 존재하지 않습니다."));

                if (!schedule.getCircle().getCircleId().equals(circleId)) {
                        throw new IllegalArgumentException("해당 서클의 일정이 아닙니다.");
                }

                return scheduleMemberRepository.findByScheduleAndStatus(schedule, ScheduleMemberStatus.JOIN)
                                .stream()
                                .map(ScheduleMemberResponseDTO::new)
                                .collect(Collectors.toList());
        }

        // 승인 대기 멤버 목록 조회 (일정 생성자 또는 서클 리더만)
        @Transactional(readOnly = true)
        public List<ScheduleMemberResponseDTO> getPendingMembers(Long circleId, Long scheduleId, Long userId) {

                Circle circle = circleRepository.findById(circleId)
                                .orElseThrow(() -> new IllegalArgumentException("서클이 존재하지 않습니다."));

                Schedule schedule = scheduleRepository.findById(scheduleId)
                                .orElseThrow(() -> new IllegalArgumentException("일정이 존재하지 않습니다."));

                boolean isCreator = schedule.getCreator().getUser().getUserId().equals(userId);
                boolean isLeader = circleMemberRepository
                                .findByCircleAndUserAndRole(circle,
                                                usersRepository.findById(userId)
                                                                .orElseThrow(() -> new IllegalArgumentException("사용자 없음")),
                                                CircleRole.LEADER)
                                .isPresent();

                if (!isCreator && !isLeader) {
                        throw new AccessDeniedException("일정 생성자 또는 서클 리더만 조회할 수 있습니다.");
                }

                return scheduleMemberRepository.findByScheduleAndStatus(schedule, ScheduleMemberStatus.PENDING)
                                .stream()
                                .map(ScheduleMemberResponseDTO::new)
                                .collect(Collectors.toList());
        }

        // 승인 대기 멤버 승인 (일정 생성자 또는 서클 리더만)
        @Transactional
        public void approveMember(Long circleId, Long scheduleId, Long scheduleMemberId, Long userId) {

                Circle circle = circleRepository.findById(circleId)
                                .orElseThrow(() -> new IllegalArgumentException("서클이 존재하지 않습니다."));

                Schedule schedule = scheduleRepository.findById(scheduleId)
                                .orElseThrow(() -> new IllegalArgumentException("일정이 존재하지 않습니다."));

                boolean isCreator = schedule.getCreator().getUser().getUserId().equals(userId);
                boolean isLeader = circleMemberRepository
                                .findByCircleAndUserAndRole(circle,
                                                usersRepository.findById(userId)
                                                                .orElseThrow(() -> new IllegalArgumentException("사용자 없음")),
                                                CircleRole.LEADER)
                                .isPresent();

                if (!isCreator && !isLeader) {
                        throw new AccessDeniedException("일정 생성자 또는 서클 리더만 승인할 수 있습니다.");
                }

                ScheduleMember sm = scheduleMemberRepository.findById(scheduleMemberId)
                                .orElseThrow(() -> new IllegalArgumentException("참여 요청이 존재하지 않습니다."));

                if (sm.getStatus() != ScheduleMemberStatus.PENDING) {
                        throw new IllegalStateException("승인 대기 중인 멤버가 아닙니다.");
                }

                if (schedule.getCurrentMember() >= schedule.getMaxMember()) {
                        throw new IllegalStateException("정원이 초과되어 승인할 수 없습니다.");
                }

                sm.approve();
                schedule.increaseCurrentMember();
        }

        // 승인 대기 멤버 거절 (일정 생성자 또는 서클 리더만)
        @Transactional
        public void rejectMember(Long circleId, Long scheduleId, Long scheduleMemberId, Long userId) {

                Circle circle = circleRepository.findById(circleId)
                                .orElseThrow(() -> new IllegalArgumentException("서클이 존재하지 않습니다."));

                Schedule schedule = scheduleRepository.findById(scheduleId)
                                .orElseThrow(() -> new IllegalArgumentException("일정이 존재하지 않습니다."));

                boolean isCreator = schedule.getCreator().getUser().getUserId().equals(userId);
                boolean isLeader = circleMemberRepository
                                .findByCircleAndUserAndRole(circle,
                                                usersRepository.findById(userId)
                                                                .orElseThrow(() -> new IllegalArgumentException("사용자 없음")),
                                                CircleRole.LEADER)
                                .isPresent();

                if (!isCreator && !isLeader) {
                        throw new AccessDeniedException("일정 생성자 또는 서클 리더만 거절할 수 있습니다.");
                }

                ScheduleMember sm = scheduleMemberRepository.findById(scheduleMemberId)
                                .orElseThrow(() -> new IllegalArgumentException("참여 요청이 존재하지 않습니다."));

                if (sm.getStatus() != ScheduleMemberStatus.PENDING) {
                        throw new IllegalStateException("승인 대기 중인 멤버가 아닙니다.");
                }

                sm.cancel();
        }

        // 내가 참석한 일정 목록 (날짜 범위 필터 선택적)
        @Transactional(readOnly = true)
        public List<ScheduleResponseDTO> getMySchedules(Long userId, LocalDateTime from, LocalDateTime to) {
                List<ScheduleMember> members = scheduleMemberRepository.findByUserIdWithDateFilter(userId, from, to);
                if (members.isEmpty()) return List.of();

                List<Schedule> schedules = members.stream().map(ScheduleMember::getSchedule).toList();

                // 태그 일괄 조회 (1 query) — 일정별 N회 호출 방지
                Map<Long, List<TagResponseDTO>> tagMap = scheduleTagRepository
                                .findAllByScheduleIn(schedules)
                                .stream()
                                .collect(Collectors.groupingBy(
                                                st -> st.getSchedule().getScheduleId(),
                                                Collectors.mapping(
                                                                st -> TagResponseDTO.builder()
                                                                                .id(st.getTag().getId())
                                                                                .name(st.getTag().getName())
                                                                                .build(),
                                                                Collectors.toList())));

                return schedules.stream()
                                .map(s -> new ScheduleResponseDTO(s, true,
                                                tagMap.getOrDefault(s.getScheduleId(), List.of())))
                                .toList();
        }

        // 장소관련! 내가 생성한 앞으로의 일정 목록 (장소 예약 패널 일정 연결용)
        @Transactional(readOnly = true)
        public List<MyUpcomingScheduleDTO> getMyCreatedUpcomingSchedules(Long userId) {
                return scheduleRepository.findMyCreatedUpcoming(userId, LocalDateTime.now())
                                .stream()
                                .map(s -> new MyUpcomingScheduleDTO(
                                                s.getScheduleId(),
                                                s.getTitle(),
                                                s.getStartAt(),
                                                s.getEndAt(),
                                                s.getCircle().getCircleId(),
                                                s.getCircle().getName()))
                                .toList();
        }

        // 장소관련! 일정에 활성 예약이 있는지 확인 (삭제 전 프론트 팝업용)
        @Transactional(readOnly = true)
        public boolean hasActiveReservation(Long scheduleId) {
                return paymentService.hasActiveReservation(scheduleId);
        }

        // 태그 저장 헬퍼
        private List<TagResponseDTO> saveTags(Schedule schedule, List<Long> tagIds) {
                if (tagIds == null || tagIds.isEmpty())
                        return List.of();
                List<Tag> tags = tagRepository.findAllById(tagIds).stream()
                                .filter(Tag::getIsActive)
                                .toList();
                tags.forEach(tag -> scheduleTagRepository.save(
                                ScheduleTag.builder().schedule(schedule).tag(tag).build()));
                return tags.stream()
                                .map(tag -> TagResponseDTO.builder()
                                                .id(tag.getId())
                                                .name(tag.getName())
                                                .build())
                                .toList();
        }

        // 일정 생성자 위임 (현재 생성자가 다른 참여자에게 위임하고 본인 참여 취소)
        @Transactional
        public void delegateScheduleCreator(
                        Long circleId,
                        Long scheduleId,
                        Long newCreatorScheduleMemberId,
                        Long userId) {

                Users loginUser = usersRepository.findById(userId)
                                .orElseThrow(() -> new IllegalArgumentException("사용자가 존재하지 않습니다."));

                Schedule schedule = scheduleRepository.findById(scheduleId)
                                .orElseThrow(() -> new IllegalArgumentException("일정이 존재하지 않습니다."));

                if (!schedule.getCircle().getCircleId().equals(circleId)) {
                        throw new AccessDeniedException("서클이 일치하지 않습니다.");
                }

                // 현재 생성자인지 확인
                CircleMember currentCreator = circleMemberRepository
                                .findByCircleAndUser_UserIdAndStatus(
                                                schedule.getCircle(),
                                                loginUser.getUserId(),
                                                CircleMemberStatus.ACTIVE)
                                .orElseThrow(() -> new AccessDeniedException("서클 멤버만 가능합니다."));

                if (!schedule.getCreator().getId().equals(currentCreator.getId())) {
                        throw new AccessDeniedException("일정 생성자만 위임할 수 있습니다.");
                }

                // 새 생성자의 ScheduleMember 조회
                ScheduleMember newCreatorSm = scheduleMemberRepository.findById(newCreatorScheduleMemberId)
                                .orElseThrow(() -> new IllegalArgumentException("해당 참여자를 찾을 수 없습니다."));

                if (!newCreatorSm.getSchedule().getScheduleId().equals(scheduleId)) {
                        throw new IllegalArgumentException("해당 일정의 참여자가 아닙니다.");
                }

                if (newCreatorSm.getStatus() != ScheduleMemberStatus.JOIN) {
                        throw new IllegalStateException("JOIN 상태인 참여자에게만 위임할 수 있습니다.");
                }

                if (newCreatorSm.getCircleMember().getId().equals(currentCreator.getId())) {
                        throw new IllegalArgumentException("본인에게는 위임할 수 없습니다.");
                }

                // 생성자 변경
                schedule.changeCreator(newCreatorSm.getCircleMember());

                // 기존 생성자 참여 취소
                ScheduleMember currentCreatorSm = scheduleMemberRepository
                                .findByScheduleAndCircleMember(schedule, currentCreator)
                                .orElseThrow(() -> new IllegalStateException("기존 생성자의 참여 정보가 없습니다."));

                if (LocalDateTime.now().isAfter(schedule.getStartAt().minusDays(1))) {
                        throw new IllegalStateException("일정 시작 24시간 전까지만 위임할 수 있습니다.");
                }

                currentCreatorSm.cancel();
                schedule.decreaseCurrentMember();
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
                if (schedule.getCreator().getId().equals(member.getId())) {
                        throw new IllegalStateException("일정 생성자는 참여를 취소할 수 없습니다. 일정을 삭제해 주세요.");
                }

                // JOIN 상태면 24h 체크 및 인원 감소, PENDING 상태면 바로 취소
                if (scheduleMember.getStatus() == ScheduleMemberStatus.JOIN) {
                        if (LocalDateTime.now().isAfter(schedule.getStartAt().minusDays(1))) {
                                throw new IllegalStateException("일정 시작 24시간 전까지만 취소할 수 있습니다.");
                        }
                        scheduleMember.cancel();
                        schedule.decreaseCurrentMember();
                } else if (scheduleMember.getStatus() == ScheduleMemberStatus.PENDING) {
                        scheduleMember.cancel();
                } else {
                        throw new IllegalStateException("참여 중인 일정이 아닙니다.");
                }
        }
}