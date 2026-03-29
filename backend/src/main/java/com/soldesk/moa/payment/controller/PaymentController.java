package com.soldesk.moa.payment.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.soldesk.moa.auth.dto.AuthUserDTO;
import com.soldesk.moa.payment.dto.PaymentConfirmRequest;
import com.soldesk.moa.payment.dto.ReservationHoldRequest;
import com.soldesk.moa.payment.dto.ReservationHoldResponse;
import com.soldesk.moa.payment.service.PaymentService;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
@Tag(name = "Payment section", description = "Response MOA API")
@RequiredArgsConstructor
@RequestMapping("/api/reservations")
public class PaymentController {
    private final PaymentService  paymentService;

    // 1. 시간대 선점
    @PostMapping("/hold")
    public ResponseEntity<ReservationHoldResponse> hold(
        @AuthenticationPrincipal AuthUserDTO authUserDTO,
        @RequestBody ReservationHoldRequest request) {

        ReservationHoldResponse response = paymentService.hold(authUserDTO.getUserId(), request);
        return ResponseEntity.ok(response);
    }

    // 2. 결제 승인 확정
    @PostMapping("/confirm")
    public ResponseEntity<Void> confirm(
        @AuthenticationPrincipal AuthUserDTO authUserDTO,
        @RequestBody PaymentConfirmRequest request){

        paymentService.confirm(authUserDTO.getUserId(), request);

        return ResponseEntity.ok().build();
    }

    // 예약 취소 + 환불
    @PostMapping("/{reservationId}/cancel")
    public ResponseEntity<Void> cancel(
        @AuthenticationPrincipal AuthUserDTO authUserDTO,
        @PathVariable Long reservationId,
        @RequestParam String cancelReason) {

        paymentService.cancel(authUserDTO.getUserId(), reservationId, cancelReason);

        return ResponseEntity.ok().build();
    }
    
    
}
