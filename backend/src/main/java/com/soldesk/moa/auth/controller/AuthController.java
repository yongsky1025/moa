package com.soldesk.moa.auth.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.soldesk.moa.auth.dto.AuthResponseDTO;
import com.soldesk.moa.auth.dto.AuthTokenBundleDTO;
import com.soldesk.moa.auth.dto.LoginRequestDTO;
import com.soldesk.moa.auth.dto.SignUpRequestDTO;
import com.soldesk.moa.auth.service.AuthService;
import com.soldesk.moa.security.JwtProperties;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Log4j2
@RestController
public class AuthController {

    private static final String REFRESH_COOKIE_NAME = "refreshToken";

    private final AuthService authService;
    private final JwtProperties jwtProperties;

    @Value("${app.cookie.secure:false}")
    private boolean secureCookie;

    @Value("${app.cookie.same-site:Lax}")
    private String sameSite;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@Valid @RequestBody SignUpRequestDTO dto) {
        authService.signup(dto);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> postLogin(
            @Valid @RequestBody LoginRequestDTO dto,
            HttpServletResponse response) {
        AuthTokenBundleDTO tokenBundle = authService.login(dto);
        response.addHeader(HttpHeaders.SET_COOKIE, createRefreshCookie(tokenBundle.refreshToken()).toString());
        return ResponseEntity.ok(new AuthResponseDTO(tokenBundle.accessToken(), tokenBundle.user()));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponseDTO> refresh(
            @CookieValue(value = REFRESH_COOKIE_NAME, required = false) String refreshToken,
            HttpServletResponse response) {
        AuthTokenBundleDTO tokenBundle = authService.refresh(refreshToken);
        response.addHeader(HttpHeaders.SET_COOKIE, createRefreshCookie(tokenBundle.refreshToken()).toString());
        return ResponseEntity.ok(new AuthResponseDTO(tokenBundle.accessToken(), tokenBundle.user()));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            @CookieValue(value = REFRESH_COOKIE_NAME, required = false) String refreshToken,
            HttpServletResponse response) {
        authService.logout(refreshToken);
        response.addHeader(HttpHeaders.SET_COOKIE, clearRefreshCookie().toString());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/me")
    public Authentication getAuthenticationInfo() {
        return SecurityContextHolder.getContext().getAuthentication();
    }

    private ResponseCookie createRefreshCookie(String token) {
        long maxAgeSeconds = Math.max(1L, jwtProperties.getRefreshTokenTtlMs() / 1000L);
        return ResponseCookie.from(REFRESH_COOKIE_NAME, token)
                .httpOnly(true)
                .secure(secureCookie)
                .path("/api/auth")
                .maxAge(maxAgeSeconds)
                .sameSite(sameSite)
                .build();
    }

    private ResponseCookie clearRefreshCookie() {
        return ResponseCookie.from(REFRESH_COOKIE_NAME, "")
                .httpOnly(true)
                .secure(secureCookie)
                .path("/api/auth")
                .maxAge(0)
                .sameSite(sameSite)
                .build();
    }
}
