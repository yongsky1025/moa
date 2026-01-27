package com.soldesk.moa.users.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.validation.BindingResult;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.web.bind.annotation.GetMapping;

import com.soldesk.moa.users.dto.SignUpRequestDTO;
import com.soldesk.moa.users.repository.UsersRepository;
import com.soldesk.moa.users.service.UsersService;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import org.springframework.web.bind.annotation.PostMapping;

@RequestMapping("/auth")
@RequiredArgsConstructor
@Log4j2
@Controller
public class AuthController {

    private final UsersService usersService;
    private final UsersRepository usersRepository;

    

    // 회원가입 요청
    @PostMapping("/signup")
    public String signup(@Valid SignUpRequestDTO dto, BindingResult result,
    RedirectAttributes rttr) {
    log.info("회원 가입 요청 {}", dto);

    // 1. 중복 이메일/닉네임 확인
    if (usersRepository.existsByEmail(dto.getEmail())) {
    result.rejectValue("email", "duplicate", "이미 사용 중인 이메일입니다.");
    }
    if (usersRepository.existsByNickname(dto.getNickname())) {
    result.rejectValue("nickname", "duplicate", "이미 사용 중인 닉네임입니다.");
    }

    // 2. 유효성 검사
    if (result.hasErrors()) {
    return "users/signup";
    }

    usersService.signup(dto);
    return "redirect:/auth/login";
    }

    // 로그인 폼 요청
    @GetMapping("/login")
    public String login() {
    log.info("로그인 폼 요청");
    return "/users/login";
    }


    // 로그인 이후 Security Context 에 담긴 정보 확인)(개발)
    @ResponseBody
    @GetMapping("/auth")
    public Authentication getAuthenticationInfo() {

        SecurityContext context = SecurityContextHolder.getContext();
        Authentication authentication = context.getAuthentication();
        return authentication;
    }

}
