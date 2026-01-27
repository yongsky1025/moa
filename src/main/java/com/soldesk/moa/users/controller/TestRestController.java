package com.soldesk.moa.users.controller;

import org.springframework.boot.autoconfigure.neo4j.Neo4jProperties.Authentication;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.soldesk.moa.users.dto.AuthUserDTO;
import com.soldesk.moa.users.dto.LoginRequestDTO;
import com.soldesk.moa.users.dto.SignUpRequestDTO;
import com.soldesk.moa.users.entity.Users;
import com.soldesk.moa.users.service.AuthService;
import com.soldesk.moa.users.service.UsersService;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@RequestMapping("/auth")
@RequiredArgsConstructor
@Log4j2
@RestController
public class TestRestController {

    private final UsersService usersService;
    private final AuthService authService;

    @PostMapping("/rsignup")
    public ResponseEntity<Void> signup(@RequestBody SignUpRequestDTO dto) {
        usersService.signup(dto);
        return ResponseEntity.ok().build();
    }

    // REST 로그인
    @PostMapping("/rlogin")
    public ResponseEntity<AuthUserDTO> login(@RequestBody LoginRequestDTO dto, HttpServletRequest request) {

        // 1. 이메일/비밀번호 검증
        AuthUserDTO authUser = authService.login(dto.getEmail(), dto.getPassword());

        // 2. Authentication 객체 생성
        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                authUser, // principal
                null, // credentials (이미 검증됨)
                authUser.getAuthorities() // 권한
        );

        // 3. SecurityContext에 등록
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);

        // 4. 세션에 SecurityContext 저장 (로그인 유지)
        request.getSession(true).setAttribute(
                HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY,
                context);

        return ResponseEntity.ok(authUser);
    }
}
