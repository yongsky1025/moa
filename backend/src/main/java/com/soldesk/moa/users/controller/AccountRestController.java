package com.soldesk.moa.users.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.soldesk.moa.auth.dto.AuthUserDTO;
import com.soldesk.moa.users.dto.account.PasswordUpdateRequestDTO;
import com.soldesk.moa.users.dto.account.WithdrawRequestDTO;
import com.soldesk.moa.users.service.AccountService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@RequestMapping("/api/users/account")
@RequiredArgsConstructor
@Log4j2
@RestController
public class AccountRestController {

    private final AccountService accountService;

    // 비밀번호 변경
    @PreAuthorize("isAuthenticated()")
    @PostMapping("/password")
    public ResponseEntity<?> changePassword(@AuthenticationPrincipal AuthUserDTO authUser,
            @Valid @RequestBody PasswordUpdateRequestDTO dto) {
        log.info("비밀번호 변경 요청 userId={}", authUser.getUserId());
        accountService.changePassword(dto, authUser.getUserId());
        return ResponseEntity.ok().build();
    }

    // 회원 탈퇴
    @PreAuthorize("isAuthenticated()")
    @PostMapping("/withdraw")
    public ResponseEntity<?> withdraw(@AuthenticationPrincipal AuthUserDTO authUser,
            @Valid @RequestBody WithdrawRequestDTO dto) {
        log.info("회원 탈퇴 요청 userId={}", authUser.getUserId());
        accountService.withdraw(authUser.getUserId(), dto.getPassword());
        return ResponseEntity.ok().build();
    }
}
