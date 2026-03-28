package com.soldesk.moa.chat.config;

import com.soldesk.moa.auth.dto.AuthUserDTO;
import com.soldesk.moa.security.JwtTokenProvider;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;

import java.security.Principal;

/**
 * STOMP CONNECT 시 Authorization 헤더의 Bearer JWT를 검증하여 Principal로 등록.
 *
 * 클라이언트는 STOMP CONNECT 프레임에 아래 헤더를 포함해야 함:
 *   Authorization: Bearer {accessToken}
 *
 * X-User-Id 헤더를 그대로 신뢰하던 방식에서,
 * JWT 토큰을 실제로 검증하는 방식으로 변경하여 유저 위장을 방지.
 */
@Component
public class ChatChannelInterceptor implements ChannelInterceptor {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserDetailsService userDetailsService;

    public ChatChannelInterceptor(JwtTokenProvider jwtTokenProvider, UserDetailsService userDetailsService) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.userDetailsService = userDetailsService;
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor =
                MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            String bearerToken = accessor.getFirstNativeHeader("Authorization");
            if (bearerToken == null || !bearerToken.startsWith("Bearer ")) {
                System.err.println("[ChatChannelInterceptor] Authorization 헤더 없음");
                return message;
            }
            String token = bearerToken.substring(7);
            if (!jwtTokenProvider.isValidToken(token) || !jwtTokenProvider.isAccessToken(token)) {
                System.err.println("[ChatChannelInterceptor] JWT 유효하지 않음: " + token.substring(0, Math.min(20, token.length())) + "...");
                return message;
            }
            String email = jwtTokenProvider.getEmailFromToken(token);
            AuthUserDTO userDetails = (AuthUserDTO) userDetailsService.loadUserByUsername(email);
            accessor.setUser(new UserPrincipal(userDetails.getUserId()));
            System.out.println("[ChatChannelInterceptor] 인증 성공 userId=" + userDetails.getUserId());
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
