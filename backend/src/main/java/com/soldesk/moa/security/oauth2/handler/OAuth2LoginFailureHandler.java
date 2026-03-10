package com.soldesk.moa.security.oauth2.handler;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.stereotype.Component;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.log4j.Log4j2;

/**
 * OAuth2 소셜 로그인 실패 핸들러.
 * 에러 메시지와 함께 프론트엔드로 리다이렉트
 */
@Log4j2
@Component
public class OAuth2LoginFailureHandler implements AuthenticationFailureHandler {

    @Value("${cors.allowed-origins:http://localhost:5173}")
    private String frontendUrl;

    @Override
    public void onAuthenticationFailure(HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException exception) throws IOException {

        log.error("OAuth2 로그인 실패: {}", exception.getMessage());

        String errorMessage = URLEncoder.encode(exception.getLocalizedMessage(), StandardCharsets.UTF_8);
        String redirectUrl = frontendUrl + "/oauth2/callback?error=" + errorMessage;

        response.sendRedirect(redirectUrl);
    }
}
