package com.soldesk.moa.admin.log.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/logs/test")
public class AdminLogTestController {

    @PostMapping("/log")
    public String testLog() {
        return "ok";
    }

}
