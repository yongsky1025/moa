package com.soldesk.moa.schedule.dto;

import java.time.LocalDateTime;

import com.soldesk.moa.schedule.entity.Schedule;

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

    public ScheduleResponseDTO(Schedule schedule) {
        this.scheduleId = schedule.getScheduleId();
        this.title = schedule.getTitle();
        this.description = schedule.getDescription();
        this.startAt = schedule.getStartAt();
        this.endAt = schedule.getEndAt();
        this.maxMember = schedule.getMaxMember();
    }
}