package com.soldesk.moa.payment.service;

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
import com.soldesk.moa.place.repository.PlaceRepository;
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

    private final ReservationRepository reservationRepository;
    private final PaymentRepository paymentRepository;
    private final ScheduleRepository scheduleRepository;
    private final TossPaymentClient tossPaymentClient;
    private final UsersRepository usersRepository;
    private final PlaceRepository placeRepository;

    // 1. 시간대를 선점, 결제창 열기전에 호출
    public ReservationHoldResponse hold(Long userId, ReservationHoldRequest request) {

        // 장소 조회
        var place = placeRepository.findById(request.placeId())
            .orElseThrow(() -> new EntityNotFoundException("장소를 찾을 수 없습니다."));

        long minutes = ChronoUnit.MINUTES.between(request.startTime(), request.endTime());

        // 시간 유효성 검증
        if (minutes <= 0) {
            throw new IllegalArgumentException("시작 시간이 종료 시간보다 늦습니다.");
        }
        if (minutes < place.getMinReservationMinutes()) {
            throw new IllegalArgumentException("최소 예약 시간은 " + place.getMinReservationMinutes() + "분입니다.");
        }
        if (minutes > place.getMaxReservationMinutes()) {
            throw new IllegalArgumentException("최대 예약 시간은 " + place.getMaxReservationMinutes() + "분입니다.");
        }

        // 시간대 중복 검증
        if (reservationRepository.existsOverlapping(place.getId(), request.startTime(), request.endTime())) {
            throw new IllegalStateException("이미 선점된 시간대입니다.");
        }

        // 금액 계산(분단위로 하래)
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

    // 2. 결제 승인 확정, 프론트에서 토스 결제창을 완료 -> paymentKey를 받아서 서버에서 최종 검증 및 승인;
    public void confirm(Long userId, PaymentConfirmRequest request) {

        // 예약 조회
        Reservation reservation = reservationRepository.findById(request.reservationId())
                .orElseThrow(() -> new EntityNotFoundException("예약을 찾을 수 없습니다."));

        // 예약자 본인이 맞는지 확인
        if (!reservation.getReservedBy().getUserId().equals(userId)) {
            throw new IllegalStateException("본인의 예약만 승인할 수 있습니다.");
        }

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
                .status(PaymentStatus.DONE)
                .approvedAt(tossConfirmResponse.getApprovedAt().toLocalDateTime())
                .build();

        paymentRepository.save(payment);

        // 예약 상태 확정
        reservation.setReservationStatus(ReservationStatus.RESERVED);
    }

    // 예약 취소 + 결제 환불
    public void cancel(Long userId, Long reservationId, String cancelReason){
        Reservation reservation = reservationRepository.findById(reservationId)
            .orElseThrow(()->new EntityNotFoundException("예약을 찾을 수 없습니다."));

        // 본인 예약인지 검증
        if(!reservation.getReservedBy().getUserId().equals(userId)){
            throw new IllegalStateException("본인의 예약만 취소할 수 있습니다.");
        }

        // reserved 상태만 취소 가능
        if(reservation.getReservationStatus() != ReservationStatus.RESERVED){
            throw new IllegalStateException("취소 가능한 예약이 아닙니다.");
        }

        // 조회 후 취소 api호출
        Payment payment = paymentRepository.findByReservationId(reservationId)
            .orElseThrow(()->new EntityNotFoundException("결제 정보를 찾을 수 없습니다."));

        tossPaymentClient.cancel(payment.getPaymentKey(), cancelReason);

        payment.cancel(cancelReason);
        reservation.setReservationStatus(ReservationStatus.CANCELLED);
    }

    // 결제 대기 만료 메소드(스케줄러용)
    @Transactional
    public void expireHoldings(){
        reservationRepository.findExpiredHoldings(LocalDateTime.now())
            .forEach(r -> r.setReservationStatus(ReservationStatus.EXPIRED));
    }
}
