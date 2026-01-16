package com.soldesk.moa.users.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.soldesk.moa.users.dto.LoginRequestDTO;
import com.soldesk.moa.users.dto.UserCreateRequestDTO;
import com.soldesk.moa.users.dto.UserResponseDTO;
import com.soldesk.moa.users.entity.constant.CustomUserDetails;
import com.soldesk.moa.users.service.UsersService;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/auth")
public class AuthController {

        private final AuthenticationManager authenticationManager;
        private final UsersService usersService;

        @PostMapping("/login")
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
                SecurityContext context = SecurityContextHolder.createEmptyContext();
                context.setAuthentication(auth);

                // 4. 쿠키 생성(왜 자동으로 안생기는지는 모르겠음??)
                httpRequest.getSession(true)
                                .setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY,
                                                context);

                return ResponseEntity.ok().build();
        }

        @PostMapping("/signup")
        public ResponseEntity<Void> signup(
                        @RequestBody UserCreateRequestDTO request) {

                usersService.signup(request);

                return ResponseEntity.ok().build();
        }

        // 로그인한 사용자 정보 조회
        @GetMapping("/me")
        public ResponseEntity<UserResponseDTO> me(
                        @AuthenticationPrincipal CustomUserDetails userDetails) {
                return ResponseEntity.ok(
                                usersService.getMyInfo(userDetails));
        }

}
