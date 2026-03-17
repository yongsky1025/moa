package com.soldesk.moa.schedule.dto;

import java.time.LocalDateTime;

import com.soldesk.moa.schedule.entity.Schedule;
import com.soldesk.moa.schedule.entity.constant.ScheduleStatus;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class ScheduleResponseDTO {

    private Long scheduleId;
    private String title;
    private String description;
    private LocalDateTime startAt;
    private LocalDateTime endAt;
    private int maxMember;
    private ScheduleStatus status;

    public ScheduleResponseDTO(Schedule schedule) {
        this.scheduleId = schedule.getScheduleId();
        this.title = schedule.getTitle();
        this.description = schedule.getDescription();
        this.startAt = schedule.getStartAt();
        this.endAt = schedule.getEndAt();
        this.maxMember = schedule.getMaxMember();
        this.status = schedule.getStatus();
    }
}