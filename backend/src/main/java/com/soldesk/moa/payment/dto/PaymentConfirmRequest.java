package com.soldesk.moa.payment.dto;

// 결제 승인 요청(프론트가 토스 결제 완료 후 서버로 보냄)
public record PaymentConfirmRequest(
        Long reservationId,
        String paymentKey, // 토스가 발급하는 키
        String orderId, // 우리가 발급했던uuid
        Integer amount // 프론트에서 올라온 금액(위변조검증)
) {

}
