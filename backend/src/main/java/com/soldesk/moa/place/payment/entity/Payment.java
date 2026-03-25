package com.soldesk.moa.place.payment.entity;

import com.soldesk.moa.common.entity.BaseEntity;
import com.soldesk.moa.place.payment.entity.constant.PaymentStatus;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Getter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Builder
public class Payment extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String impUid; // 포트원 결제 고유 번호

    private String merchanUid; // 이쪽 주문 번호

    private Integer amount; // 결제 금액

    private Integer cancelAmount; // 환불된 금액

    @Enumerated(EnumType.STRING)
    private PaymentStatus paymentStatus; // 결제 상태
}
