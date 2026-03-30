package com.soldesk.moa.payment.dto;

import java.time.LocalDateTime;

public record MyUpcomingScheduleDTO(
    Long scheduleId,
    String title,
    LocalDateTime startAt,
    LocalDateTime endAt,
    Long circleId,
    String circleName
) {}
