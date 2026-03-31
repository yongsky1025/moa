package com.soldesk.moa.schedule.dto;

import java.time.LocalDateTime;

import com.soldesk.moa.place.entity.Reservation;
import com.soldesk.moa.place.entity.constant.ReservationStatus;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ScheduleReservationDTO {

    private Long reservationId;
    private Long placeId;
    private String placeName;
    private String placeAddress;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer totalPrice;
    private ReservationStatus status;

    public ScheduleReservationDTO(Reservation reservation) {
        this.reservationId = reservation.getId();
        this.placeId = reservation.getPlace().getId();
        this.placeName = reservation.getPlace().getName();
        this.placeAddress = reservation.getPlace().getAddress();
        this.startTime = reservation.getStartTime();
        this.endTime = reservation.getEndTime();
        this.totalPrice = reservation.getTotalPrice();
        this.status = reservation.getReservationStatus();
    }
}
