package com.soldesk.moa.place.scheduler;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.soldesk.moa.place.entity.Reservation;
import com.soldesk.moa.place.entity.constant.ReservationStatus;
import com.soldesk.moa.place.repository.ReservationRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
@Transactional
public class ReservationScheduler {

    private final ReservationRepository reservationRepository;

    @Scheduled(cron = "0 0 * * * *")
    public void updateReservationStatus() {

        List<Reservation> reservations = reservationRepository.findExpiredReservations(LocalDateTime.now());

        for (Reservation reservation : reservations) {
            reservation.setReservationStatus(ReservationStatus.COMPLETED);
        }
    }
}
