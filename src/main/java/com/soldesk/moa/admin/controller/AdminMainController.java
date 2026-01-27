// package com.soldesk.moa.admin.controller;

// import org.springframework.web.bind.annotation.RequestMapping;
// import org.springframework.web.bind.annotation.RestController;

// import com.soldesk.moa.admin.dto.AdminMainDTO;
// import com.soldesk.moa.admin.service.AdminService;

// import io.swagger.v3.oas.annotations.Operation;
// import io.swagger.v3.oas.annotations.tags.Tag;
// import lombok.RequiredArgsConstructor;
// import lombok.extern.log4j.Log4j2;
// import org.springframework.web.bind.annotation.GetMapping;

// @RestController
// @Tag(name = "Admin section", description = "Response MOA API")
// @RequiredArgsConstructor
// @RequestMapping("/admin")
// @Log4j2
// public class AdminMainController {

// private final AdminService adminService;

// @GetMapping("")
// @Operation(summary = "admin main data", description = "메인페이지 data")
// public AdminMainDTO getAdminMain() {
// log.info("admin main page");
// return adminService.getMoaInfo();
// }

// }
