package com.soldesk.moa.security;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "jwt")
public class JwtProperties {

    private String secret;
    private Long accessExpMs;
    private Long refreshExpMs;
    // Legacy key fallback.
    private Long expiration;

    // TTL : Time To Live
    // new accessToken 생성 시 수명 설정값(accessExpMs/30분)
    public long getAccessTokenTtlMs() {
        if (accessExpMs != null) {
            return accessExpMs;
        }
        if (expiration != null) {
            return expiration;
        }
        return 1_800_000L;
    }

    // new refreshToken 생성 시, 수명 설정값(refreshExpMs/14일)
    public long getRefreshTokenTtlMs() {
        if (refreshExpMs != null) {
            return refreshExpMs;
        }
        return 1_209_600_000L;
    }
}
