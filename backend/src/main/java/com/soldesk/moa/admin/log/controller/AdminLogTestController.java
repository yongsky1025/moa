package com.soldesk.moa.admin.log.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/logs/test")
@PreAuthorize("hasRole('ADMIN')")
public class AdminLogTestController {

    // 개발 테스트용입니다.
    @PostMapping("/log")
    public String testLog() {
        return "ok";
    }

}
