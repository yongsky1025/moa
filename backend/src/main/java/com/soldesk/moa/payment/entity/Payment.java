package com.soldesk.moa.payment.entity;

import java.time.LocalDateTime;

import com.soldesk.moa.common.entity.BaseEntity;
import com.soldesk.moa.payment.entity.constant.PaymentStatus;
import com.soldesk.moa.place.entity.Reservation;
import com.soldesk.moa.users.entity.Users;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED) // 결제는 함부로 객체생성 못하게 막자
@AllArgsConstructor
@ToString(exclude = {"reservation", "user"})
@Builder
public class Payment extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reservation_id" ,nullable = false, unique = true)
    private Reservation reservation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private Users user;

    @Column(nullable = false, unique = true, length = 200)
    private String paymentKey; // 토스 발급 고유 키

    @Column(nullable = false, unique = true, length = 100)
    private String orderId; // 모아가 생성한 uuid주문번호

    @Column(nullable = false)
    private Integer amount; // 총 가격 (시간당가격x예약시간)

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private PaymentStatus status = PaymentStatus.PENDING;

    @Column(length = 50)
    private String method; // 결제방법(카드,가상계좌등)

    private LocalDateTime approvedAt; // 승인시각

    private LocalDateTime cancelledAt; // 취소시각

    private String cancelReason; // 취소사유

    // 승인
    public void approve(LocalDateTime approvedAt) {
        this.status = PaymentStatus.DONE;
        this.approvedAt = approvedAt;
    }

    // 취소
    public void cancel(String reason) {
        this.status = PaymentStatus.CANCELED;
        this.cancelReason = reason;
        this.cancelledAt = LocalDateTime.now();
    }

    // 환불 없이 취소 처리 (24시간 이내 취소)
    public void cancelNoRefund(String reason) {
        this.status = PaymentStatus.CANCELED;
        this.cancelReason = reason + " (환불 불가)";
        this.cancelledAt = LocalDateTime.now();
    }
}
