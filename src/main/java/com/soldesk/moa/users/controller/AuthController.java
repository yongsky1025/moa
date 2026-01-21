package com.soldesk.moa.users.controller;

import org.springframework.stereotype.Controller;
import org.springframework.validation.BindingResult;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.web.bind.annotation.GetMapping;

import com.soldesk.moa.users.dto.SignUpRequestDTO;
import com.soldesk.moa.users.service.UsersService;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import org.springframework.web.bind.annotation.PostMapping;

@RequestMapping("/auth")
@RequiredArgsConstructor
@Log4j2
@Controller
public class AuthController {

    private final UsersService usersService;

    @GetMapping("/login")
    public String getLogIn() {
        log.info("로그인 폼 요청");
        return "/users/login";
    }

    @GetMapping("/signup")
    public String getSignUp(SignUpRequestDTO dto) {
        log.info("회원가입 폼 요청");
        return "/users/signup";
    }

    @PostMapping("/signup")
    public String signup(@Valid SignUpRequestDTO dto, BindingResult result, RedirectAttributes rttr) {
        log.info("회원 가입 요청 {}", dto);

        if (result.hasErrors()) {
            return "/auth/signup";
        }

        try {
            usersService.signup(dto);
        } catch (Exception e) {
            rttr.addFlashAttribute("dupEmail", e.getMessage());
            return "redirect:/auth/signup";
        }

        return "redirect:/auth/login";
    }

}
