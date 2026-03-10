package com.soldesk.moa.chat.config;

import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.stereotype.Component;

import java.security.Principal;

/**
 * STOMP CONNECT 시 헤더의 X-User-Id 값을 읽어 Principal로 등록.
 * Spring Security 인증과 무관하게 WebSocket 연결에서 사용자 식별.
 */
@Component
public class ChatChannelInterceptor implements ChannelInterceptor {

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor =
                MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            String userId = accessor.getFirstNativeHeader("X-User-Id");
            if (userId != null && !userId.isBlank()) {
                accessor.setUser(new UserPrincipal(Long.parseLong(userId)));
            }
        }
        return message;
    }

    /** WebSocket 세션 동안 사용자를 식별하기 위한 간단한 Principal 구현 */
    record UserPrincipal(Long userId) implements Principal {
        @Override
        public String getName() {
            return userId.toString();
        }
    }
}
