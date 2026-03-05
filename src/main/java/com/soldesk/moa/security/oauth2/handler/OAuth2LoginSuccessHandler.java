package com.soldesk.moa.security.oauth2.handler;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import com.soldesk.moa.auth.service.RefreshTokenService;
import com.soldesk.moa.security.JwtProperties;
import com.soldesk.moa.security.JwtTokenProvider;
import com.soldesk.moa.security.oauth2.dto.CustomOAuth2User;
import com.soldesk.moa.users.entity.Users;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

/**
 * OAuth2 소셜 로그인 성공 핸들러.
 * JWT access/refresh token 발급 → 프론트엔드 리다이렉트
 */
@RequiredArgsConstructor
@Log4j2
@Component
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final JwtTokenProvider jwtTokenProvider;
    private final RefreshTokenService refreshTokenService;
    private final JwtProperties jwtProperties;

    @Value("${cors.allowed-origins:http://localhost:5173}")
    private String frontendUrl;

    @Value("${app.cookie.secure:false}")
    private boolean secureCookie;

    @Value("${app.cookie.same-site:Lax}")
    private String sameSite;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication) throws IOException {

        CustomOAuth2User oAuth2User = (CustomOAuth2User) authentication.getPrincipal();
        Users user = oAuth2User.getUser();

        log.info("OAuth2 로그인 성공 → JWT 발급: email={}", user.getEmail());

        // 1) JWT 토큰 발급
        String accessToken = jwtTokenProvider.createAccessToken(user.getEmail(), user.getUserRole());
        String refreshToken = refreshTokenService.createAndStoreRefreshToken(user);

        // 2) Refresh token → HttpOnly 쿠키
        long maxAgeSeconds = Math.max(1L, jwtProperties.getRefreshTokenTtlMs() / 1000L);
        ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)
                .secure(secureCookie)
                .path("/api/auth")
                .maxAge(maxAgeSeconds)
                .sameSite(sameSite)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());

        // 3) 프론트엔드로 리다이렉트 (access token은 URL 파라미터로 전달)
        String encodedToken = URLEncoder.encode(accessToken, StandardCharsets.UTF_8);
        String redirectUrl = frontendUrl + "/oauth2/callback?token=" + encodedToken;

        log.info("OAuth2 리다이렉트: {}", frontendUrl + "/oauth2/callback");
        response.sendRedirect(redirectUrl);
    }
}
