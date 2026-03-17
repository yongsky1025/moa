package com.soldesk.moa.notification.controller;

import com.soldesk.moa.auth.dto.AuthUserDTO;
import com.soldesk.moa.notification.dto.NotificationResponse;
import com.soldesk.moa.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    /** 내 알림 목록 조회 */
    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getMyNotifications(
            @AuthenticationPrincipal AuthUserDTO user) {
        return ResponseEntity.ok(notificationService.getMyNotifications(user.getUserId()));
    }

    /** 알림 읽음 처리 */
    @PostMapping("/{id}/read")
    public ResponseEntity<Void> markRead(
            @PathVariable Long id,
            @AuthenticationPrincipal AuthUserDTO user) {
        notificationService.markRead(id, user.getUserId());
        return ResponseEntity.ok().build();
    }

    /** 알림 전체 읽음 처리 */
    @PostMapping("/read-all")
    public ResponseEntity<Void> markAllRead(@AuthenticationPrincipal AuthUserDTO user) {
        notificationService.markAllRead(user.getUserId());
        return ResponseEntity.ok().build();
    }
}
