package com.soldesk.moa.payment.dto;

import java.time.OffsetDateTime;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true) // 알 수 없는 필드 무시, 토스응답에 모르는 필드가 많다고함
public class TossConfirmResponse {

    private String paymentKey;
    private String orderId;
    private String status; // DONE이면 성공
    private Integer totalAmount;
    private String method; // 결제방법
    private OffsetDateTime approvedAt;
}
