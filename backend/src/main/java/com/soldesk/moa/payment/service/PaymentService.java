package com.soldesk.moa.payment.service;

import com.soldesk.moa.users.controller.AccountRestController;
import com.soldesk.moa.users.service.AccountService;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.soldesk.moa.payment.client.TossPaymentClient;
import com.soldesk.moa.payment.dto.PaymentConfirmRequest;
import com.soldesk.moa.payment.dto.ReservationHoldRequest;
import com.soldesk.moa.payment.dto.ReservationHoldResponse;
import com.soldesk.moa.payment.dto.TossConfirmResponse;
import com.soldesk.moa.payment.entity.Payment;
import com.soldesk.moa.payment.entity.constant.PaymentStatus;
import com.soldesk.moa.payment.repository.PaymentRepository;
import com.soldesk.moa.place.entity.Reservation;
import com.soldesk.moa.place.entity.constant.ReservationStatus;
import com.soldesk.moa.place.repository.ReservationRepository;
import com.soldesk.moa.schedule.repository.ScheduleRepository;
import com.soldesk.moa.users.entity.Users;
import com.soldesk.moa.users.repository.UsersRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class PaymentService {

    private final AccountService accountService;
    private final AccountRestController accountRestController;
    private final ReservationRepository reservationRepository;
    private final PaymentRepository paymentRepository;
    private final ScheduleRepository scheduleRepository;
    private final TossPaymentClient tossPaymentClient;
    private final UsersRepository usersRepository;

    // 1. 시간대를 선점, 결제창 열기전에 호출
    public ReservationHoldResponse hold(Long userId, ReservationHoldRequest request) {

        // 장소 조회
        var place = reservationRepository.findById(request.placeId())
                .map(Reservation::getPlace).orElseThrow(() -> new EntityNotFoundException("장소를 찾을 수 없습니다."));

        // 시간대 중복 검증
        if (reservationRepository.existsOverlapping(place.getId(), request.startTime(), request.endTime())) {
            throw new IllegalStateException("이미 선점된 시간대입니다.");
        }

        // 금액 계산(분단위로 하래)
        long minutes = ChronoUnit.MINUTES.between(request.startTime(), request.endTime());
        int totalPrice = (int) (place.getPricePerHour() * minutes / 60.0);

        // orderId 주문번호는 서버에서 uuid로 생성해주기
        String orderId = UUID.randomUUID().toString();

        Users user = usersRepository.getReferenceById(userId);

        Reservation reservation = Reservation.builder()
                .place(place)
                .reservedBy(user)
                .startTime(request.startTime())
                .endTime(request.endTime())
                .totalPrice(totalPrice)
                .orderId(orderId)
                .reservationStatus(ReservationStatus.HOLDING)
                .holdExpiredAt(LocalDateTime.now().plusMinutes(20)) // 20분 준다
                .schedule(
                        request.scheduleId() != null ? scheduleRepository.getReferenceById(request.scheduleId()) : null)
                .build();

        reservationRepository.save(reservation);

        String orderName = place.getName() + " " + (minutes / 60) + "시간 예약";

        return new ReservationHoldResponse(reservation.getId(), orderId, totalPrice, orderName);
    }

    // 1. 결제 승인 확정, 프론트에서 토스 결제창을 완료 -> paymentKey를 받아서 서버에서 최종 검증 및 승인;
    public void confirm(Long userId, PaymentConfirmRequest request) {

        // 예약 조회
        Reservation reservation = reservationRepository.findById(request.reservationId())
                .orElseThrow(() -> new EntityNotFoundException("예약을 찾을 수 없습니다."));

        // 선점(holding)중인지 확인해라.
        if (reservation.getReservationStatus() != ReservationStatus.HOLDING) {
            throw new IllegalStateException("예약 선점 상태가 아닙니다.");
        }

        // 선점 시간 만료됐는지도 확인(20분 줬다)
        if (LocalDateTime.now().isAfter(reservation.getHoldExpiredAt())) {
            throw new IllegalStateException("예약 선점 시간이 만료되었습니다. 다시 예약해주세요.");
        }

        // ******* 금액 위변조 검증
        if (!reservation.getTotalPrice().equals(request.amount())) {
            throw new IllegalStateException("결제 금액이 일치하지 않습니다.");
        }

        // 주문번호 orderId 위변조 검즘
        if (!reservation.getOrderId().equals(request.orderId())) {
            throw new IllegalStateException("주문 정보가 일치하지 않습니다.");
        }

        // 토스 최종승인 api 호출
        TossConfirmResponse tossConfirmResponse = tossPaymentClient.confirm(request.paymentKey(), request.orderId(),
                request.amount());

        // 결제 entity저장
        Payment payment = Payment.builder()
                .reservation(reservation)
                .user(reservation.getReservedBy())
                .paymentKey(tossConfirmResponse.getPaymentKey())
                .orderId(tossConfirmResponse.getOrderId())
                .amount(tossConfirmResponse.getTotalAmount())
                .method(tossConfirmResponse.getMethod())
                .status(PaymentStatus.PAID)
                .approvedAt(tossConfirmResponse.getApprovedAt())
                .build();

        paymentRepository.save(payment);

        // 예약 확정
        reservation.setReservationStatus(ReservationStatus.RESERVED);
    }
}
