package com.soldesk.moa.payment.dto;

import java.time.LocalDateTime;

public record MyReservationDTO(
    Long reservationId,
    Long placeId,
    String placeName,
    LocalDateTime startTime,
    LocalDateTime endTime,
    Integer totalPrice,
    String status
) {}
