package com.soldesk.moa.users.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.soldesk.moa.users.dto.LoginRequestDTO;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class AuthController {

        private final AuthenticationManager authenticationManager;

        @PostMapping("/auth/login")
        public ResponseEntity<Void> login(
                        @RequestBody LoginRequestDTO request,
                        HttpServletRequest httpRequest) {

                // 1. 로그인 토큰 생성 (아직 인증 안 됨)
                UsernamePasswordAuthenticationToken token = new UsernamePasswordAuthenticationToken(
                                request.getEmail(),
                                request.getPassword());

                // 2. 인증 시도
                Authentication auth = authenticationManager.authenticate(token);

                // 3. 인증 성공 → SecurityContext에 저장
                SecurityContextHolder.getContext()
                                .setAuthentication(auth);

                return ResponseEntity.ok().build();
        }

}
