package com.soldesk.moa.payment.dto;

// 예약 선점 응답 dto
public record ReservationHoldResponse(
        Long reservationId,
        String orderId, // 서버가 생성한uuid 프론트가 토스 sdk에 넘김
        Integer amount,
        String orderName // 결제창에 표시될 이름
) {

}
