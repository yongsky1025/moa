package com.soldesk.moa.chat.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import com.soldesk.moa.common.config.CorsProperties;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final ChatChannelInterceptor chatChannelInterceptor;
    private final CorsProperties corsProperties;

    public WebSocketConfig(ChatChannelInterceptor chatChannelInterceptor, CorsProperties corsProperties) {
        this.chatChannelInterceptor = chatChannelInterceptor;
        this.corsProperties = corsProperties;
    }

    /**
     * 클라이언트 WebSocket 연결 엔드포인트.
     * SockJS 폴백 지원으로 구형 브라우저도 대응.
     */
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // 브라우저용 (SockJS 폴백 지원)
        registry.addEndpoint("/ws/chat")
                .setAllowedOriginPatterns(corsProperties.getAllowedOriginPatterns().toArray(new String[0]))
                .withSockJS();

        // Postman / 앱 클라이언트용 (Raw WebSocket)
        registry.addEndpoint("/ws/chat-raw")
                .setAllowedOriginPatterns(corsProperties.getAllowedOriginPatterns().toArray(new String[0]));
    }

    /**
     * 메시지 브로커 설정.
     * - /topic : 서버 → 구독 클라이언트 (브로드캐스트)
     * - /app   : 클라이언트 → 서버 (@MessageMapping prefix)
     */
    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic");
        registry.setApplicationDestinationPrefixes("/app");
    }

    /** CONNECT 프레임 처리 시 userId 헤더를 Principal로 변환 */
    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(chatChannelInterceptor);
    }
}
