package com.soldesk.moa.payment.client;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import com.soldesk.moa.payment.dto.TossConfirmResponse;
import com.soldesk.moa.payment.exception.TossPaymentException;

@Component
public class TossPaymentClient {

    private final WebClient webClient;

    public TossPaymentClient(
            @Value("${toss.payments.secret-key}") String secretKey) {

        // 토스 규격 - 시크릿키:를 base64 인코딩
        String encoded = Base64.getEncoder()
                .encodeToString((secretKey + ":").getBytes(StandardCharsets.UTF_8));

        this.webClient = WebClient.builder()
                .baseUrl("https://api.tosspayments.com")
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Basic " + encoded)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    // 결제 최종 승인
    public TossConfirmResponse confirm(String paymentKey, String orderId, Integer amount) {

        return webClient.post()
                .uri("/v1/payments/confirm")
                .bodyValue(Map.of(
                        "paymentKey", paymentKey,
                        "orderId", orderId,
                        "amount", amount))
                .retrieve()
                .onStatus(HttpStatusCode::is4xxClientError,
                        response -> response.bodyToMono(String.class)
                                .map(err -> new TossPaymentException("결제 승인 실패: " + err)))
                .onStatus(HttpStatusCode::is5xxServerError,
                        response -> response.bodyToMono(String.class)
                                .map(err -> new TossPaymentException("토스 서버 오류: " + err)))
                .bodyToMono(TossConfirmResponse.class)
                .block();
    }

    // 결제 취소
    public void cancel(String paymentKey, String cancelReason) {
        webClient.post()
                .uri("/v1/payments/{paymentKey}/cancel", paymentKey)
                .bodyValue(Map.of("cancelReason", cancelReason))
                .retrieve()
                .onStatus(HttpStatusCode::is4xxClientError,
                        response -> response.bodyToMono(String.class)
                                .map(err -> new TossPaymentException("취소 실패: " + err)))
                .bodyToMono(Void.class)
                .block();
    }
}
