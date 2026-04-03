package com.soldesk.moa.schedule.controller;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.soldesk.moa.auth.dto.AuthUserDTO;
import com.soldesk.moa.payment.dto.MyUpcomingScheduleDTO;
import com.soldesk.moa.schedule.dto.ScheduleResponseDTO;
import com.soldesk.moa.schedule.service.ScheduleService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/schedules")
public class UserScheduleController {

    private final ScheduleService scheduleService;

    // 내가 참석한 일정 목록 (from/to 날짜 필터 선택적)
    @GetMapping("/my")
    public ResponseEntity<List<ScheduleResponseDTO>> getMySchedules(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @AuthenticationPrincipal AuthUserDTO authUserDTO) {

        return ResponseEntity.ok(scheduleService.getMySchedules(authUserDTO.getUserId(), from, to));
    }

    // 내가 생성한 앞으로의 일정 목록 (장소 예약 패널 일정 연결용)
    @GetMapping("/my/created-upcoming")
    public ResponseEntity<List<MyUpcomingScheduleDTO>> getMyCreatedUpcomingSchedules(
            @AuthenticationPrincipal AuthUserDTO authUserDTO) {
        return ResponseEntity.ok(scheduleService.getMyCreatedUpcomingSchedules(authUserDTO.getUserId()));
    }
}
