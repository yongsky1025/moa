package com.soldesk.moa.users.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.web.bind.annotation.GetMapping;

import com.soldesk.moa.users.dto.SignUpRequestDTO;
import com.soldesk.moa.users.service.CustomUserService;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RequiredArgsConstructor
@Log4j2
@Controller
public class AuthController {

    private final CustomUserService customUserService;

    @GetMapping("/auth/login")
    public void logIn() {
        log.info("로그인 폼 요청");
    }

    @PostMapping("/auth/logout")
    public void logOut() {
        log.info("로그아웃 요청");
    }

    @GetMapping("/auth/signup")
    public void getSignUp(SignUpRequestDTO dto) {
        log.info("회원가입 폼 요청");
    }

    @PostMapping("/auth/signup")
    public ResponseEntity<?> signup(@RequestBody @Valid SignUpRequestDTO dto) {
        customUserService.signup(dto);
        return ResponseEntity.ok("회원가입 완료");
    }

}
