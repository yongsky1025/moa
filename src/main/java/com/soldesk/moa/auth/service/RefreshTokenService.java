package com.soldesk.moa.auth.service;

import java.time.Duration;
import java.time.LocalDateTime;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.soldesk.moa.auth.entity.RefreshToken;
import com.soldesk.moa.auth.repository.RefreshTokenRepository;
import com.soldesk.moa.common.exception.InvalidTokenException;
import com.soldesk.moa.security.JwtProperties;
import com.soldesk.moa.security.JwtTokenProvider;
import com.soldesk.moa.users.entity.Users;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final JwtProperties jwtProperties;

    @Transactional
    // 1 user당 refresh token 1개 유지(있으면 갱신, 없으면 생성)
    public String createAndStoreRefreshToken(Users user) {
        String refreshToken = jwtTokenProvider.createRefreshToken(user.getEmail());
        LocalDateTime expiresAt = LocalDateTime.now().plus(Duration.ofMillis(jwtProperties.getRefreshTokenTtlMs()));

        RefreshToken entity = refreshTokenRepository.findByUser_UserId(user.getUserId())
                .orElseGet(() -> RefreshToken.builder().user(user).build());
        entity.updateToken(refreshToken, expiresAt);
        refreshTokenRepository.save(entity);

        return refreshToken;
    }

    // JWT token 검증 + DB에 저장된 토큰과 일치 확인 후 사용자 반환
    @Transactional(readOnly = true)
    public Users validateRefreshTokenAndGetUser(String token) {
        if (!StringUtils.hasText(token)) {
            throw new InvalidTokenException("Refresh token is required.");
        }

        if (!jwtTokenProvider.isValidToken(token) || !jwtTokenProvider.isRefreshToken(token)) {
            throw new InvalidTokenException("Invalid refresh token.");
        }

        RefreshToken savedToken = refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new InvalidTokenException("Refresh token not found."));

        if (savedToken.isExpired()) {
            throw new InvalidTokenException("Refresh token expired.");
        }

        String emailFromToken = jwtTokenProvider.getEmailFromToken(token);
        if (!savedToken.getUser().getEmail().equals(emailFromToken)) {
            throw new InvalidTokenException("Refresh token mismatch.");
        }

        return savedToken.getUser();
    }

    @Transactional
    public void revoke(String token) {
        if (!StringUtils.hasText(token)) {
            return;
        }
        refreshTokenRepository.deleteByToken(token);
    }
}
