package com.soldesk.moa.payment.dto;

import java.time.LocalDateTime;

// 예약 선점 요청
public record ReservationHoldRequest(
        Long placeId,
        LocalDateTime startTime,
        LocalDateTime endTime,
        Long scheduleId // 일정이면 값있고 아님 null
) {

}
