package com.soldesk.moa.security;

import java.io.IOException;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Log4j2
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;
    // Loads user details from DB using token subject(email).
    private final UserDetailsService userDetailsService;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {

        // CORS preflight(OPTIONS)는 인증 대상이 아니므로 필터에서 제외
        if (request.getMethod().equals("OPTIONS"))
            return true;

        String path = request.getRequestURI();
        log.info("check uri " + path);

        // 인증/로그인 엔드포인트는 JWT 필터 적용X
        if (path.startsWith("/swagger-ui") || path.startsWith("/v3/api-docs") || path.startsWith("/api/auth"))
            return true;

        // TODO: 공개 API가 늘어나면 permitAll 경로를 SecurityConfig에서 일괄 정리

        return false;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        String token = jwtTokenProvider.extractBearerToken(request);

        if (token != null
                && jwtTokenProvider.isValidToken(token)
                && jwtTokenProvider.isAccessToken(token)
                && SecurityContextHolder.getContext().getAuthentication() == null) {

            String email = jwtTokenProvider.getEmailFromToken(token);
            UserDetails userDetails = userDetailsService.loadUserByUsername(email);

            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                    userDetails,
                    null,
                    userDetails.getAuthorities());

            // Authentication 객체 설정 -> @AuthenticationPrincipal
            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        // 다음 FilterChain 계속 실행
        filterChain.doFilter(request, response);
    }
}
