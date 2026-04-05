package com.soldesk.moa.chat.service;

import com.soldesk.moa.chat.domain.ChatRoom;
import com.soldesk.moa.chat.domain.RoomType;
import com.soldesk.moa.chat.repository.ChatRoomMemberRepository;
import com.soldesk.moa.chat.repository.ChatRoomRepository;
import com.soldesk.moa.circle.entity.constant.CircleMemberStatus;
import com.soldesk.moa.circle.repository.CircleMemberRepository;
import com.soldesk.moa.notification.domain.NotificationType;
import com.soldesk.moa.notification.dto.NotificationResponse;
import com.soldesk.moa.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 채팅 메시지 알림을 백그라운드에서 처리.
 * WebSocket 알람 푸시를 DB 저장보다 먼저 실행해 수신자에게 즉시 전달.
 */
@Component
@RequiredArgsConstructor
public class ChatNotificationDispatcher {

    private final ChatRoomMemberRepository memberRepo;
    private final ChatRoomRepository roomRepo;
    private final CircleMemberRepository circleMemberRepo;
    private final NotificationService notificationService;
    private final SimpMessagingTemplate messagingTemplate;

    @Async
    public void dispatch(Long roomId, Long senderId, String senderNickname, String content) {
        ChatRoom room = roomRepo.findById(roomId).orElse(null);
        if (room == null) return;

        List<Long> recipientIds;
        if (room.getType() == RoomType.GROUP && room.getCircleId() != null) {
            // GROUP 방: chat_room_member가 아직 없는 멤버도 포함하기 위해 circle_member 기준으로 조회
            recipientIds = circleMemberRepo.findByCircle_CircleIdAndStatus(room.getCircleId(), CircleMemberStatus.ACTIVE)
                    .stream()
                    .map(m -> m.getUser().getUserId())
                    .filter(uid -> !uid.equals(senderId))
                    .collect(Collectors.toList());
        } else {
            recipientIds = memberRepo.findByRoomId(roomId).stream()
                    .filter(m -> !m.getUserId().equals(senderId))
                    .map(m -> m.getUserId())
                    .collect(Collectors.toList());
        }

        if (recipientIds.isEmpty()) return;

        RoomType roomType = roomRepo.findById(roomId)
                .map(ChatRoom::getType)
                .orElse(RoomType.DIRECT);

        String prefix = switch (roomType) {
            case GROUP -> "[모임] ";
            case SCHEDULE -> "[일정] ";
            default -> "";
        };

        String message = prefix + senderNickname + " 님의 메시지가 도착했습니다: " + content;

        // 1. WebSocket 알람 즉시 전송 (DB 저장 전 — 트랜잭션 없음)
        NotificationResponse alarm = new NotificationResponse(
                null, NotificationType.CHAT_MESSAGE,
                message, false, LocalDateTime.now(), roomId
        );
        recipientIds.forEach(uid ->
                messagingTemplate.convertAndSend("/topic/alarm/" + uid, alarm));

        // 2. DB 저장 (이력 보존용, 순차 처리)
        recipientIds.forEach(uid ->
                notificationService.saveOnly(uid, NotificationType.CHAT_MESSAGE, message, roomId));
    }
}
