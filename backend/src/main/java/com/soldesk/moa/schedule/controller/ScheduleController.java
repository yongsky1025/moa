package com.soldesk.moa.schedule.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.soldesk.moa.schedule.dto.ScheduleCreateRequestDTO;
import com.soldesk.moa.schedule.dto.ScheduleMemberResponseDTO;
import com.soldesk.moa.schedule.dto.ScheduleResponseDTO;
import com.soldesk.moa.schedule.dto.ScheduleReviewCreateRequestDTO;
import com.soldesk.moa.schedule.dto.ScheduleReviewResponseDTO;
import com.soldesk.moa.schedule.dto.ScheduleUpdateRequestDTO;
import com.soldesk.moa.schedule.service.ScheduleReviewService;
import com.soldesk.moa.schedule.service.ScheduleService;
import com.soldesk.moa.auth.dto.AuthUserDTO;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/circles/{circleId}/schedules")
public class ScheduleController {

    private final ScheduleService scheduleService;
    private final ScheduleReviewService scheduleReviewService;

    // 서클 일정 목록 조회 (서클 멤버만, from/to 날짜 필터 선택적)
    @GetMapping
    public ResponseEntity<List<ScheduleResponseDTO>> getSchedules(
            @PathVariable Long circleId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @AuthenticationPrincipal AuthUserDTO authUserDTO) {

        return ResponseEntity.ok(scheduleService.getSchedules(circleId, authUserDTO.getUserId(), from, to));
    }

    // 일정 참여자 목록 조회 (서클 멤버만)
    @GetMapping("/{scheduleId}/members")
    public ResponseEntity<List<ScheduleMemberResponseDTO>> getScheduleMembers(
            @PathVariable Long circleId,
            @PathVariable Long scheduleId,
            @AuthenticationPrincipal AuthUserDTO authUserDTO) {

        return ResponseEntity.ok(
                scheduleService.getScheduleMembers(circleId, scheduleId, authUserDTO.getUserId()));
    }

    // 일정 상세 조회 (서클 멤버만)
    @GetMapping("/{scheduleId}")
    public ResponseEntity<ScheduleResponseDTO> getSchedule(
            @PathVariable Long circleId,
            @PathVariable Long scheduleId,
            @AuthenticationPrincipal AuthUserDTO authUserDTO) {

        return ResponseEntity.ok(scheduleService.getSchedule(circleId, scheduleId, authUserDTO.getUserId()));
    }

    // 일정 수정 (생성자 또는 리더)
    @PutMapping("/{scheduleId}")
    public ResponseEntity<ScheduleResponseDTO> updateSchedule(
            @PathVariable Long circleId,
            @PathVariable Long scheduleId,
            @RequestBody @Valid ScheduleUpdateRequestDTO request,
            @AuthenticationPrincipal AuthUserDTO authUserDTO) {

        return ResponseEntity.ok(
                scheduleService.updateSchedule(circleId, scheduleId, request, authUserDTO.getUserId()));
    }

    // 일정 생성
    @PostMapping
    public ResponseEntity<ScheduleResponseDTO> createSchedule(
            @PathVariable Long circleId,
            @RequestBody @Valid ScheduleCreateRequestDTO request,
            @AuthenticationPrincipal AuthUserDTO authUserDTO) {

        ScheduleResponseDTO response = scheduleService.createSchedule(
                circleId,
                request,
                authUserDTO.getUserId());

        return ResponseEntity.ok(response);
    }

    // 일정 참여
    @PostMapping("/{scheduleId}/join")
    public ResponseEntity<Void> joinSchedule(
            @PathVariable Long scheduleId,
            @AuthenticationPrincipal AuthUserDTO authUserDTO) {

        scheduleService.joinSchedule(scheduleId, authUserDTO.getUserId());
        return ResponseEntity.ok().build();
    }

    // 일정 참여 취소
    @DeleteMapping("/{scheduleId}/join")
    public ResponseEntity<Void> cancelSchedule(
            @PathVariable Long scheduleId,
            @AuthenticationPrincipal AuthUserDTO authUserDTO) {

        scheduleService.cancelSchedule(scheduleId, authUserDTO.getUserId());

        return ResponseEntity.noContent().build();
    }

    // 일정 삭제 (생성자 또는 서클 리더)
    @DeleteMapping("/{scheduleId}")
    public ResponseEntity<Void> deleteSchedule(
            @PathVariable Long circleId,
            @PathVariable Long scheduleId,
            @RequestParam(defaultValue = "false") boolean cancelReservation,
            @AuthenticationPrincipal AuthUserDTO authUserDTO) {

        scheduleService.deleteSchedule(
                circleId,
                scheduleId,
                authUserDTO.getUserId(),
                cancelReservation);

        return ResponseEntity.noContent().build();
    }

    // 일정에 활성 예약이 있는지 확인 (삭제 전 프론트 팝업용)
    @GetMapping("/{scheduleId}/has-reservation")
    public ResponseEntity<Map<String, Boolean>> hasActiveReservation(
            @PathVariable Long circleId,
            @PathVariable Long scheduleId,
            @AuthenticationPrincipal AuthUserDTO authUserDTO) {
        boolean hasReservation = scheduleService.hasActiveReservation(scheduleId);
        return ResponseEntity.ok(Map.of("hasActiveReservation", hasReservation));
    }

    // 후기 작성 (완료된 일정 참여자만)
    @PostMapping("/{scheduleId}/reviews")
    public ResponseEntity<ScheduleReviewResponseDTO> createReview(
            @PathVariable Long circleId,
            @PathVariable Long scheduleId,
            @RequestBody @Valid ScheduleReviewCreateRequestDTO request,
            @AuthenticationPrincipal AuthUserDTO authUserDTO) {

        return ResponseEntity.ok(
                scheduleReviewService.createReview(circleId, scheduleId, request, authUserDTO.getUserId()));
    }

    // 후기 목록 조회 (서클 멤버만)
    @GetMapping("/{scheduleId}/reviews")
    public ResponseEntity<List<ScheduleReviewResponseDTO>> getReviews(
            @PathVariable Long circleId,
            @PathVariable Long scheduleId,
            @AuthenticationPrincipal AuthUserDTO authUserDTO) {

        return ResponseEntity.ok(
                scheduleReviewService.getReviews(circleId, scheduleId, authUserDTO.getUserId()));
    }

    // 서클 전체 후기 목록 조회 (page/size 파라미터, 기본값: 0/6)
    @GetMapping("/reviews")
    public ResponseEntity<List<ScheduleReviewResponseDTO>> getCircleReviews(
            @PathVariable Long circleId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "6") int size,
            @AuthenticationPrincipal AuthUserDTO authUserDTO) {

        return ResponseEntity.ok(
                scheduleReviewService.getCircleReviews(circleId, authUserDTO.getUserId(), page, size));
    }

    // 후기 삭제 (작성자 본인 또는 리더/부리더)
    @DeleteMapping("/{scheduleId}/reviews/{reviewId}")
    public ResponseEntity<Void> deleteReview(
            @PathVariable Long circleId,
            @PathVariable Long scheduleId,
            @PathVariable Long reviewId,
            @AuthenticationPrincipal AuthUserDTO authUserDTO) {

        scheduleReviewService.deleteReview(circleId, scheduleId, reviewId, authUserDTO.getUserId());
        return ResponseEntity.noContent().build();
    }
}
