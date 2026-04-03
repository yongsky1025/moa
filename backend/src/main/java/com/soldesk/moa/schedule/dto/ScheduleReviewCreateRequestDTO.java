package com.soldesk.moa.schedule.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ScheduleReviewCreateRequestDTO {

    @NotBlank(message = "후기 내용을 입력해주세요.")
    private String content;

    @NotNull(message = "별점을 입력해주세요.")
    @Min(value = 1, message = "별점은 최소 1점입니다.")
    @Max(value = 5, message = "별점은 최대 5점입니다.")
    private Integer rating;
}
