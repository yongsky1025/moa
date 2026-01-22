package com.soldesk.moa.schedule.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.soldesk.moa.schedule.dto.ScheduleCreateRequestDTO;
import com.soldesk.moa.schedule.dto.ScheduleResponseDTO;
import com.soldesk.moa.schedule.service.ScheduleService;
import com.soldesk.moa.users.entity.Users;
import com.soldesk.moa.users.entity.constant.CustomUserDetails;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/{circleId}/schedules")
public class ScheduleController {

    private final ScheduleService scheduleService;

    // 일정 생성
    @PostMapping
    public ResponseEntity<ScheduleResponseDTO> createSchedule(
            @PathVariable Long circleId,
            @RequestBody @Valid ScheduleCreateRequestDTO request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        ScheduleResponseDTO response = scheduleService.createSchedule(
                circleId,
                request,
                userDetails.getUser());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/{scheduleId}/join")
    public ResponseEntity<Void> joinSchedule(
            @PathVariable Long scheduleId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        scheduleService.joinSchedule(scheduleId, userDetails.getUser());
        return ResponseEntity.ok().build();
    }
}