package com.soldesk.moa.schedule.dto;

import java.time.LocalDateTime;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class ScheduleCreateRequestDTO {

    @NotBlank
    private String title;

    @NotBlank
    private String description;

    @NotNull
    private LocalDateTime startAt;

    @NotNull
    private LocalDateTime endAt;

    @Min(2)
    private int maxMember;

    // 위치는 optional
    private String location;
    private Double latitude;
    private Double longitude;
}
