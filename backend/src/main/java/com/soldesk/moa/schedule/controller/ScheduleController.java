package com.soldesk.moa.schedule.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.soldesk.moa.schedule.dto.ScheduleCreateRequestDTO;
import com.soldesk.moa.schedule.dto.ScheduleResponseDTO;
import com.soldesk.moa.schedule.dto.ScheduleUpdateRequestDTO;
import com.soldesk.moa.schedule.service.ScheduleService;
import com.soldesk.moa.auth.dto.AuthUserDTO;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/circles/{circleId}/schedules")
public class ScheduleController {

    private final ScheduleService scheduleService;

    // 서클 일정 목록 조회 (서클 멤버만)
    @GetMapping
    public ResponseEntity<List<ScheduleResponseDTO>> getSchedules(
            @PathVariable Long circleId,
            @AuthenticationPrincipal AuthUserDTO authUserDTO) {

        return ResponseEntity.ok(scheduleService.getSchedules(circleId, authUserDTO.getUserId()));
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

    // 일정 삭제 (생성자만 가능)
    @DeleteMapping("/{scheduleId}")
    public ResponseEntity<Void> deleteSchedule(
            @PathVariable Long circleId,
            @PathVariable Long scheduleId,
            @AuthenticationPrincipal AuthUserDTO authUserDTO) {

        scheduleService.deleteSchedule(
                circleId,
                scheduleId,
                authUserDTO.getUserId());

        return ResponseEntity.noContent().build();
    }
}