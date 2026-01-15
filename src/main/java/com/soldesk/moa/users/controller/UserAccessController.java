package com.soldesk.moa.users.controller;

import org.springframework.stereotype.Controller;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.RequestMapping;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import com.soldesk.moa.users.dto.UsersDTO;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.PostMapping;

@RequestMapping("/users")
@RequiredArgsConstructor
@Log4j2
@Controller
public class UserAccessController {

    @GetMapping("/login")
    public void getLogin() {
        log.info("로그인 폼 요청");
    }

    @GetMapping("/register")
    public void getRegister(UsersDTO dto) {
        log.info("회원가입 폼 요청");
    }

    @PostMapping("/register")
    public String postRegister(@Valid UsersDTO dto, BindingResult result, RedirectAttributes rttr) {
        log.info("회원가입 요청 {}, dto");

        if (result.hasErrors()) {
            return "/users/register";
        }

        return "redirect:/users/login";
    }

}
