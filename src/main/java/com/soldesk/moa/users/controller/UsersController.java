package com.soldesk.moa.users.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import com.soldesk.moa.users.dto.AuthUserDTO;
import com.soldesk.moa.users.dto.PasswordUpdateRequestDTO;
import com.soldesk.moa.users.dto.UserProfileResponseDTO;
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

    // 대시보드(My Page) 조회
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/dashboard")
    public String dashboard() {
        log.info("My Page 요청");
        return "/users/dashboard";
    }

    // 프로필 view 조회
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/profile")
    public String profile() {
        log.info("profile 폼 요청");
        return "/users/profile";
    }

}
