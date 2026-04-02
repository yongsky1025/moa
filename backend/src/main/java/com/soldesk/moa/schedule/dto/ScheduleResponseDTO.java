package com.soldesk.moa.schedule.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.soldesk.moa.place.dto.TagResponseDTO;
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
    private Long circleId;
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
    private boolean isPending;
    private boolean isCreator;
    private int pendingCount;
    private List<TagResponseDTO> tags;
    private Long chatRoomId;
    private ScheduleReservationDTO reservation;

    public ScheduleResponseDTO(Schedule schedule) {
        this.scheduleId = schedule.getScheduleId();
        this.circleId = schedule.getCircle().getCircleId();
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
        this.tags = List.of();
    }

    public ScheduleResponseDTO(Schedule schedule, boolean joined) {
        this(schedule);
        this.joined = joined;
    }

    public ScheduleResponseDTO(Schedule schedule, boolean joined, List<TagResponseDTO> tags) {
        this(schedule, joined);
        this.tags = tags;
    }

    public ScheduleResponseDTO(Schedule schedule, Long chatRoomId) {
        this(schedule);
        this.chatRoomId = chatRoomId;
    }

    public ScheduleResponseDTO(Schedule schedule, boolean joined, List<TagResponseDTO> tags, Long chatRoomId) {
        this(schedule, joined, tags);
        this.chatRoomId = chatRoomId;
    }

    // 일정 상세 조회 전용 생성자 (isPending, isCreator, pendingCount, reservation 포함)
    public ScheduleResponseDTO(Schedule schedule, boolean joined, boolean isPending, boolean isCreator,
            int pendingCount, List<TagResponseDTO> tags, ScheduleReservationDTO reservation) {
        this(schedule, joined, tags);
        this.isPending = isPending;
        this.isCreator = isCreator;
        this.pendingCount = pendingCount;
        this.reservation = reservation;
    }
}