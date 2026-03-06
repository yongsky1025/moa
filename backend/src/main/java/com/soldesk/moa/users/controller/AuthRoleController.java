package com.soldesk.moa.users.controller;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;

@RestController
// 임시 Controller(Admin, User)
public class AuthRoleController {

    @GetMapping("/admin")
    public String adminPage() {
        return "Admin Controller";
    }

}
