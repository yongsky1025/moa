package com.soldesk.moa.notification.service;

import com.soldesk.moa.notification.domain.Notification;
import com.soldesk.moa.notification.domain.NotificationType;
import com.soldesk.moa.notification.dto.NotificationResponse;
import com.soldesk.moa.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepo;
    private final SimpMessagingTemplate messagingTemplate;

    /** 알림 저장 + WebSocket 실시간 전송 */
    @Transactional
    public void send(Long userId, NotificationType type, String message) {
        Notification saved = notificationRepo.save(Notification.of(userId, type, message));
        messagingTemplate.convertAndSend("/topic/alarm/" + userId, NotificationResponse.from(saved));
    }

    /** 내 알림 목록 조회 */
    @Transactional(readOnly = true)
    public List<NotificationResponse> getMyNotifications(Long userId) {
        return notificationRepo.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(NotificationResponse::from).toList();
    }

    /** 알림 읽음 처리 */
    @Transactional
    public void markRead(Long notificationId, Long userId) {
        Notification n = notificationRepo.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("알림이 존재하지 않습니다."));
        if (!n.getUserId().equals(userId)) {
            throw new IllegalArgumentException("권한이 없습니다.");
        }
        n.markRead();
    }

    /** 알림 전체 읽음 처리 */
    @Transactional
    public void markAllRead(Long userId) {
        notificationRepo.findByUserIdOrderByCreatedAtDesc(userId)
                .forEach(n -> { if (!n.isRead()) n.markRead(); });
    }
}
