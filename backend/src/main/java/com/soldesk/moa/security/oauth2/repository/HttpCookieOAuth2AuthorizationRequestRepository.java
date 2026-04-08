package com.soldesk.moa.security.oauth2.repository;

import java.util.Base64;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.client.web.AuthorizationRequestRepository;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;
import org.springframework.stereotype.Component;
import org.springframework.util.SerializationUtils;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

// STATELESS 세션 환경 -> OAuth2 Authorization Request(state)를 
// 세션 대신 쿠키에 저장/복원하는 클래스
@Component
public class HttpCookieOAuth2AuthorizationRequestRepository
        implements AuthorizationRequestRepository<OAuth2AuthorizationRequest> {

    private static final String COOKIE_NAME = "oauth2_auth_request";
    private static final int COOKIE_EXPIRE_SECONDS = 180; // 3분

    @Value("${app.cookie.secure:false}")
    private boolean secureCookie;

    @Value("${app.cookie.same-site:Lax}")
    private String sameSite;

    @Override
    public OAuth2AuthorizationRequest loadAuthorizationRequest(HttpServletRequest request) {
        return getCookie(request, COOKIE_NAME);
    }

    @Override
    public void saveAuthorizationRequest(OAuth2AuthorizationRequest authorizationRequest,
            HttpServletRequest request,
            HttpServletResponse response) {
        if (authorizationRequest == null) {
            deleteCookie(request, response, COOKIE_NAME);
            return;
        }

        String serialized = Base64.getUrlEncoder().encodeToString(
                SerializationUtils.serialize(authorizationRequest));

        Cookie cookie = new Cookie(COOKIE_NAME, serialized);
        cookie.setPath("/");
        cookie.setHttpOnly(true);
        cookie.setSecure(secureCookie);
        cookie.setAttribute("SameSite", sameSite);
        cookie.setMaxAge(COOKIE_EXPIRE_SECONDS);
        response.addCookie(cookie);
    }

    @Override
    public OAuth2AuthorizationRequest removeAuthorizationRequest(HttpServletRequest request,
            HttpServletResponse response) {
        OAuth2AuthorizationRequest authRequest = loadAuthorizationRequest(request);
        if (authRequest != null) {
            deleteCookie(request, response, COOKIE_NAME);
        }
        return authRequest;
    }

    // 쿠키에서 OAuth2AuthorizationRequest 역직렬화
    private OAuth2AuthorizationRequest getCookie(HttpServletRequest request, String name) {
        if (request.getCookies() == null)
            return null;

        for (Cookie cookie : request.getCookies()) {
            if (name.equals(cookie.getName())) {
                byte[] decoded = Base64.getUrlDecoder().decode(cookie.getValue());
                @SuppressWarnings("deprecation")
                Object deserialized = SerializationUtils.deserialize(decoded);
                return (OAuth2AuthorizationRequest) deserialized;
            }
        }
        return null;
    }

    // 쿠키 삭제
    private void deleteCookie(HttpServletRequest request, HttpServletResponse response, String name) {
        if (request.getCookies() == null)
            return;

        for (Cookie cookie : request.getCookies()) {
            if (name.equals(cookie.getName())) {
                Cookie clear = new Cookie(name, "");
                clear.setPath("/");
                clear.setHttpOnly(true);
                clear.setSecure(secureCookie);
                clear.setAttribute("SameSite", sameSite);
                clear.setMaxAge(0);
                response.addCookie(clear);
            }
        }
    }
}
