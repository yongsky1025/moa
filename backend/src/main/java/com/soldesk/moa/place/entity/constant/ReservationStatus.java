package com.soldesk.moa.place.entity.constant;

public enum ReservationStatus {
    HOLDING, // 선점 중 (결제 대기, 20분 타임아웃)
    RESERVED, // 결제 완료 = 예약 확정
    CANCELLED, // 취소
    COMPLETED, // 이용 완료
    EXPIRED, // 선점 시간 초과 자동 해제
}
