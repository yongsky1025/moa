package com.soldesk.moa.users.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import com.soldesk.moa.users.dto.AuthUserDTO;
import com.soldesk.moa.users.dto.PasswordDTO;
import com.soldesk.moa.users.dto.UpdateProfileDTO;
import com.soldesk.moa.users.service.UsersService;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;

@RequestMapping("/users")
@RequiredArgsConstructor
@Log4j2
@Controller
public class UsersController {

    private final UsersService usersService;

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/dashboard")
    public void overview() {
        log.info("My Page 요청");
    }

    // @PreAuthorize("isAuthenticated()")
    @GetMapping("/profile")
    public void profile() {
        log.info("profile 폼 요청");
    }

    // 닉네임 수정
    @PostMapping("/edit/nickname")
    public String postNickname(UpdateProfileDTO dto) {

        Authentication authentication = getAuthentication();
        AuthUserDTO auth = (AuthUserDTO) authentication.getPrincipal();
        dto.setEmail(auth.getUsername());
        usersService.nicknameUpdate(dto);

        SecurityContextHolder.getContext().setAuthentication(authentication);
        return "redirect:/users/profile";
    }

    // 비밀번호 수정
    @PreAuthorize("isAuthenticated()")
    @PostMapping("/edit/password")
    public String postPassword(PasswordDTO dto, HttpSession session, RedirectAttributes rttr) {
        log.info("비밀번호 수정 {}", dto);

        try {
            usersService.passwordUpdate(dto);
            session.invalidate();
        } catch (Exception e) {
            e.printStackTrace();
            rttr.addFlashAttribute("error", e.getMessage());
            return "redirect:/user/edit";
        }
        // 세선 해제 후 로그인 페이지로 이동
        return "redirect:/auth/login";
    }

    public Authentication getAuthentication() {
        SecurityContext context = SecurityContextHolder.getContext();
        Authentication authentication = context.getAuthentication();
        return authentication;
    }
}
