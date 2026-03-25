package com.soldesk.moa.security;

import java.nio.charset.StandardCharsets;
import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import lombok.extern.slf4j.Slf4j;

import com.soldesk.moa.users.entity.constant.UserRole;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.HttpServletRequest;

@Slf4j
@Component
// JWT 생성/검증 담당 Provider(access/refresh)
public class JwtTokenProvider {

    private final JwtProperties jwtProperties;
    private final SecretKey signingKey;

    public JwtTokenProvider(JwtProperties jwtProperties) {
        this.jwtProperties = jwtProperties;

        if (!StringUtils.hasText(jwtProperties.getSecret())) {
            throw new IllegalStateException("jwt.secret must not be empty");
        }

        byte[] keyBytes = decodeSecret(jwtProperties.getSecret());
        this.signingKey = Keys.hmacShaKeyFor(keyBytes);
    }

    // for legacy 'createToken'
    public String createToken(String email, UserRole role) {
        return createAccessToken(email, role, null);
    }

    public String createAccessToken(String email, UserRole role) {
        return createAccessToken(email, role, null);
    }

    public String createAccessToken(String email, UserRole role, Long userId) {
        Date now = new Date();
        Date validity = new Date(now.getTime() + jwtProperties.getAccessTokenTtlMs());

        var builder = Jwts.builder()
                .subject(email)
                .claim("role", role.name())
                .claim("type", "access");

        if (userId != null) {
            builder.claim("userId", userId);
        }

        return builder
                .issuedAt(now)
                .expiration(validity)
                .signWith(signingKey)
                .compact();
    }

    public String createRefreshToken(String email) {
        Date now = new Date();
        Date validity = new Date(now.getTime() + jwtProperties.getRefreshTokenTtlMs());

        return Jwts.builder()
                .subject(email)
                .claim("type", "refresh")
                .issuedAt(now)
                .expiration(validity)
                .signWith(signingKey)
                .compact();
    }

    public String getEmailFromToken(String token) {
        return parseClaims(token).getSubject();
    }

    public UserRole getRoleFromToken(String token) {
        String roleName = parseClaims(token).get("role", String.class);
        return roleName == null ? null : UserRole.valueOf(roleName);
    }

    public boolean isValidToken(String token) {
        if (!StringUtils.hasText(token)) {
            return false;
        }
        try {
            parseClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            log.warn("JWT validation failed: {}", e.getMessage());
            return false;
        }
    }

    // 구버전 토큰(type Claim 없음)과 호환을 위해 null도 access 허용
    public boolean isAccessToken(String token) {
        try {
            String tokenType = parseClaims(token).get("type", String.class);
            return tokenType == null || "access".equals(tokenType);
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public boolean isRefreshToken(String token) {
        try {
            String tokenType = parseClaims(token).get("type", String.class);
            return "refresh".equals(tokenType);
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public String extractBearerToken(HttpServletRequest request) {
        String bearer = request.getHeader("Authorization");
        if (StringUtils.hasText(bearer) && bearer.startsWith("Bearer ")) {
            return bearer.substring(7);
        }
        return null;
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    // 설정된 secret 형식(hex/base64/plain) 모두 지원해 key bytes로 변환
    private byte[] decodeSecret(String secret) {
        String normalized = secret == null ? "" : secret.trim();

        if (normalized.matches("^[0-9a-fA-F]+$") && normalized.length() % 2 == 0) {
            int length = normalized.length();
            byte[] bytes = new byte[length / 2];
            for (int i = 0; i < length; i += 2) {
                bytes[i / 2] = (byte) Integer.parseInt(normalized.substring(i, i + 2), 16);
            }
            return bytes;
        }

        try {
            return Decoders.BASE64.decode(normalized);
        } catch (IllegalArgumentException e) {
            return normalized.getBytes(StandardCharsets.UTF_8);
        }
    }
}
