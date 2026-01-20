package com.soldesk.moa.users.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.web.bind.annotation.GetMapping;

import com.soldesk.moa.users.dto.SignUpRequestDTO;
import com.soldesk.moa.users.service.UsersService;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RequestMapping("/auth")
@RequiredArgsConstructor
@Log4j2
@Controller
public class AuthController {

    private final UsersService userService;

    @GetMapping("/login")
    public String getLogIn() {
        log.info("로그인 폼 요청");
        return "users/login";
    }

    @GetMapping("/signup")
    public String getSignUp(SignUpRequestDTO dto) {
        log.info("회원가입 폼 요청");
        return "users/signup";
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody @Valid SignUpRequestDTO dto) {
        userService.signup(dto);
        return ResponseEntity.ok(Map.of("message", "회원가입 완료"));
    }

}
