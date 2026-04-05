package com.soldesk.moa.security.oauth2.handler;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.stereotype.Component;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.log4j.Log4j2;

/**
 * OAuth2 소셜 로그인 실패 핸들러.
 * 계정 상태 에러(정지/탈퇴/영구정지)는 상태 페이지로,
 * 나머지는 로그인 페이지로 에러 메시지와 함께 리다이렉트
 */
@Log4j2
@Component
public class OAuth2LoginFailureHandler implements AuthenticationFailureHandler {

    private static final Pattern ERROR_CODE_PATTERN = Pattern.compile("^\\[([A-Z_]+)](.+)$");
    private static final Set<String> ACCOUNT_STATUS_CODES = Set.of(
            "ACCOUNT_WITHDRAWN", "ACCOUNT_SUSPENDED", "ACCOUNT_BANNED");

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Override
    public void onAuthenticationFailure(HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException exception) throws IOException {

        log.error("OAuth2 로그인 실패: {}", exception.getMessage());

        String message = exception.getMessage();
        Matcher matcher = ERROR_CODE_PATTERN.matcher(message);

        if (matcher.matches() && ACCOUNT_STATUS_CODES.contains(matcher.group(1))) {
            String code = matcher.group(1);
            response.sendRedirect(frontendUrl + "/users/account-status?code=" + code);
            return;
        }

        String errorMessage = URLEncoder.encode(message, StandardCharsets.UTF_8);
        response.sendRedirect(frontendUrl + "/oauth2/callback?error=" + errorMessage);
    }
}
