package com.soldesk.moa.payment.service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.soldesk.moa.payment.client.TossPaymentClient;
import com.soldesk.moa.payment.dto.MyReservationDTO;
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
import com.soldesk.moa.place.service.PlaceImageService;
import com.soldesk.moa.schedule.entity.Schedule;
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
    private final PlaceImageService placeImageService;

    // 1. 시간대를 선점, 결제창 열기전에 호출
    public ReservationHoldResponse hold(Long userId, ReservationHoldRequest request) {

        var place = placeRepository.findById(request.placeId())
            .orElseThrow(() -> new EntityNotFoundException("장소를 찾을 수 없습니다."));

        if (request.startTime().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("이미 지난 시간대는 예약할 수 없습니다.");
        }

        long minutes = ChronoUnit.MINUTES.between(request.startTime(), request.endTime());

        if (minutes <= 0) {
            throw new IllegalArgumentException("시작 시간이 종료 시간보다 늦습니다.");
        }
        if (minutes < place.getMinReservationMinutes()) {
            throw new IllegalArgumentException("최소 예약 시간은 " + place.getMinReservationMinutes() + "분입니다.");
        }
        if (minutes > place.getMaxReservationMinutes()) {
            throw new IllegalArgumentException("최대 예약 시간은 " + place.getMaxReservationMinutes() + "분입니다.");
        }

        if (reservationRepository.existsOverlapping(place.getId(), request.startTime(), request.endTime())) {
            throw new IllegalStateException("이미 선점된 시간대입니다.");
        }

        // scheduleId 권한 검증: 일정 생성자(creator)만 연결 가능
        Schedule schedule = null;
        if (request.scheduleId() != null) {
            schedule = scheduleRepository.findById(request.scheduleId())
                .orElseThrow(() -> new EntityNotFoundException("일정을 찾을 수 없습니다."));
            if (!schedule.getCreator().getUser().getUserId().equals(userId)) {
                throw new IllegalStateException("일정 생성자만 장소를 예약할 수 있습니다.");
            }
        }

        int totalPrice = (int) (place.getPricePerHour() * minutes / 60.0);
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
                .holdExpiredAt(LocalDateTime.now().plusMinutes(20))
                .schedule(schedule)
                .build();

        reservationRepository.save(reservation);

        String orderName = place.getName() + " " + (minutes / 60) + "시간 예약";
        return new ReservationHoldResponse(reservation.getId(), orderId, totalPrice, orderName);
    }

    // 2. 결제 승인 확정
    public void confirm(Long userId, PaymentConfirmRequest request) {

        Reservation reservation = reservationRepository.findById(request.reservationId())
                .orElseThrow(() -> new EntityNotFoundException("예약을 찾을 수 없습니다."));

        if (!reservation.getReservedBy().getUserId().equals(userId)) {
            throw new IllegalStateException("본인의 예약만 승인할 수 있습니다.");
        }

        if (reservation.getReservationStatus() != ReservationStatus.HOLDING) {
            throw new IllegalStateException("예약 선점 상태가 아닙니다.");
        }

        if (LocalDateTime.now().isAfter(reservation.getHoldExpiredAt())) {
            throw new IllegalStateException("예약 선점 시간이 만료되었습니다. 다시 예약해주세요.");
        }

        if (!reservation.getTotalPrice().equals(request.amount())) {
            throw new IllegalStateException("결제 금액이 일치하지 않습니다.");
        }

        if (!reservation.getOrderId().equals(request.orderId())) {
            throw new IllegalStateException("주문 정보가 일치하지 않습니다.");
        }

        TossConfirmResponse tossConfirmResponse = tossPaymentClient.confirm(request.paymentKey(), request.orderId(),
                request.amount());

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
        reservation.setReservationStatus(ReservationStatus.RESERVED);
    }

    // 3. 예약 취소 + 환불 (24시간 정책 적용)
    public void cancel(Long userId, Long reservationId, String cancelReason) {
        Reservation reservation = reservationRepository.findById(reservationId)
            .orElseThrow(() -> new EntityNotFoundException("예약을 찾을 수 없습니다."));

        if (!reservation.getReservedBy().getUserId().equals(userId)) {
            throw new IllegalStateException("본인의 예약만 취소할 수 있습니다.");
        }

        if (reservation.getReservationStatus() != ReservationStatus.RESERVED) {
            throw new IllegalStateException("취소 가능한 예약이 아닙니다.");
        }

        // 24시간 환불 정책: 이용 시작 24시간 이내는 환불 불가
        boolean isRefundable = LocalDateTime.now().isBefore(reservation.getStartTime().minusHours(24));

        Payment payment = paymentRepository.findByReservationId(reservationId)
            .orElseThrow(() -> new EntityNotFoundException("결제 정보를 찾을 수 없습니다."));

        if (isRefundable) {
            tossPaymentClient.cancel(payment.getPaymentKey(), cancelReason);
            payment.cancel(cancelReason);
        } else {
            // 환불 없이 결제 상태만 CANCELED 처리 (토스 환불 API 미호출)
            payment.cancelNoRefund(cancelReason);
        }

        reservation.setReservationStatus(ReservationStatus.CANCELLED);
    }

    // 4. HOLDING 예약 즉시 해제 (결제 실패/취소 시 프론트에서 호출)
    public void releaseHolding(Long userId, Long reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
            .orElseThrow(() -> new EntityNotFoundException("예약을 찾을 수 없습니다."));

        if (!reservation.getReservedBy().getUserId().equals(userId)) {
            throw new IllegalStateException("본인의 예약만 해제할 수 있습니다.");
        }

        if (reservation.getReservationStatus() != ReservationStatus.HOLDING) {
            throw new IllegalStateException("선점 상태인 예약만 해제할 수 있습니다.");
        }

        reservation.setReservationStatus(ReservationStatus.EXPIRED);
    }

    // 5. 내 예약 목록 조회
    @Transactional(readOnly = true)
    public List<MyReservationDTO> getMyReservations(Long userId) {
        List<com.soldesk.moa.place.entity.Reservation> reservations = reservationRepository.findMyReservations(userId);
        List<Long> placeIds = reservations.stream().map(r -> r.getPlace().getId()).toList();
        java.util.Map<Long, String> repImages = placeImageService.getRepresentativeImages(placeIds);
        return reservations.stream()
                .map(r -> new MyReservationDTO(
                        r.getId(),
                        r.getPlace().getId(),
                        r.getPlace().getName(),
                        r.getStartTime(),
                        r.getEndTime(),
                        r.getTotalPrice(),
                        r.getReservationStatus().name(),
                        repImages.get(r.getPlace().getId())))
                .toList();
    }

    // 6. 일정에 연결된 활성 예약 전체 취소 (일정 삭제 시 호출, 전액 환불)
    public void cancelReservationsForSchedule(Long scheduleId) {
        reservationRepository.findActiveByScheduleId(scheduleId).forEach(r -> {
            if (r.getReservationStatus() == ReservationStatus.RESERVED) {
                paymentRepository.findByReservationId(r.getId()).ifPresent(payment -> {
                    tossPaymentClient.cancel(payment.getPaymentKey(), "일정 삭제로 인한 자동 취소");
                    payment.cancel("일정 삭제로 인한 자동 취소");
                });
                r.setReservationStatus(ReservationStatus.CANCELLED);
            } else if (r.getReservationStatus() == ReservationStatus.HOLDING) {
                r.setReservationStatus(ReservationStatus.EXPIRED);
            }
        });
    }

    // 7. 일정에 연결된 활성 예약의 일정 연결 해제 (일정 삭제 시 "장소는 유지" 선택)
    public void detachReservationsFromSchedule(Long scheduleId) {
        reservationRepository.findActiveByScheduleId(scheduleId)
                .forEach(Reservation::detachSchedule);
    }

    // 8. 일정에 활성 예약이 있는지 확인
    @Transactional(readOnly = true)
    public boolean hasActiveReservation(Long scheduleId) {
        return !reservationRepository.findActiveByScheduleId(scheduleId).isEmpty();
    }

    // 결제 대기 만료 메소드 (스케줄러용)
    @Transactional
    public void expireHoldings() {
        reservationRepository.findExpiredHoldings(LocalDateTime.now())
            .forEach(r -> r.setReservationStatus(ReservationStatus.EXPIRED));
    }
}
