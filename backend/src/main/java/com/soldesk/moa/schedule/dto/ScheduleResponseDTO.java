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
    private int currentMember;
    private ScheduleStatus status;
    private String location;
    private Double latitude;
    private Double longitude;
    private boolean joined;
    private Long chatRoomId;

    public ScheduleResponseDTO(Schedule schedule) {
        this.scheduleId = schedule.getScheduleId();
        this.title = schedule.getTitle();
        this.description = schedule.getDescription();
        this.startAt = schedule.getStartAt();
        this.endAt = schedule.getEndAt();
        this.maxMember = schedule.getMaxMember();
        this.currentMember = schedule.getCurrentMember();
        this.status = schedule.getStatus();
        this.location = schedule.getAddress();
        this.latitude = schedule.getLatitude();
        this.longitude = schedule.getLongitude();
    }

    public ScheduleResponseDTO(Schedule schedule, boolean joined) {
        this(schedule);
        this.joined = joined;
    }

    public ScheduleResponseDTO(Schedule schedule, Long chatRoomId) {
        this(schedule);
        this.chatRoomId = chatRoomId;
    }
}