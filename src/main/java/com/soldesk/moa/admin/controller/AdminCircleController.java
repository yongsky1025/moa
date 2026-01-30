package com.soldesk.moa.admin.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
@Log4j2
@RequiredArgsConstructor
@RequestMapping("/admin/circles")
public class AdminCircleController {

    @GetMapping("/list")
    public String getMethodName(@RequestParam String param) {
        return new String();
    }

}
