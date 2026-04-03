package com.soldesk.moa.schedule.dto;

import java.time.LocalDateTime;

import com.soldesk.moa.schedule.entity.ScheduleReview;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ScheduleReviewResponseDTO {

    private Long reviewId;
    private Long scheduleId;
    private String scheduleTitle;
    private Long userId;
    private String nickname;
    private String content;
    private int rating;
    private LocalDateTime createdAt;

    public static ScheduleReviewResponseDTO from(ScheduleReview review) {
        return new ScheduleReviewResponseDTO(
                review.getReviewId(),
                review.getSchedule().getScheduleId(),
                review.getSchedule().getTitle(),
                review.getCircleMember().getUser().getUserId(),
                review.getCircleMember().getUser().getNickname(),
                review.getContent(),
                review.getRating(),
                review.getCreatedAt()
        );
    }
}
