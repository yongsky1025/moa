package com.soldesk.moa.place.scheduler;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.soldesk.moa.payment.service.PaymentService;
import com.soldesk.moa.place.entity.Reservation;
import com.soldesk.moa.place.entity.constant.ReservationStatus;
import com.soldesk.moa.place.repository.ReservationRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
@Transactional
public class ReservationScheduler {

    private final ReservationRepository reservationRepository;
    private final PaymentService paymentService;

    // 예약 상태 스케줄러(사용완료되면 예약가능하게 매분마다 변경)
    @Transactional
    @Scheduled(cron = "0 * * * * *")
    public void updateReservationStatus() {

        List<Reservation> reservations = reservationRepository.findExpiredReservations(LocalDateTime.now());

        for (Reservation reservation : reservations) {
            reservation.setReservationStatus(ReservationStatus.COMPLETED);
        }
    }

    // 결제 대기 자동 만료처리(매분마다)
    @Transactional
    @Scheduled(cron = "0 * * * * *")
    public void expireHoldins(){
        paymentService.expireHoldings();
    }
}
