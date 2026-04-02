package com.soldesk.moa.payment.exception;

public class TossPaymentException extends RuntimeException {
    // 토스 결제전용 예외처리 클래스
    public TossPaymentException(String message) {
        super(message);
    }
}
