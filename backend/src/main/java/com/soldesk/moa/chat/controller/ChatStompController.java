package com.soldesk.moa.chat.controller;

import com.soldesk.moa.chat.dto.request.SendMessageRequest;
import com.soldesk.moa.chat.service.ChatMessageService;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.Map;

/**
 * STOMP 메시지 수신 및 브로드캐스트 처리.
 *
 * 클라이언트 흐름:
 *   1. SockJS 연결 → /ws/chat (헤더: X-User-Id: {userId})
 *   2. 구독 → /topic/room/{roomId}
 *   3. 메시지 전송 → /app/chat/{roomId}
 *   4. 서버가 저장 후 /topic/room/{roomId} 로 브로드캐스트
 */
@Controller
public class ChatStompController {

    private final ChatMessageService messageService;
    private final SimpMessagingTemplate messagingTemplate;

    public ChatStompController(ChatMessageService messageService, SimpMessagingTemplate messagingTemplate) {
        this.messageService = messageService;
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/chat/{roomId}")
    public void handleMessage(
            @DestinationVariable Long roomId,
            SendMessageRequest request,
            Principal principal
    ) {
        if (principal == null) {
            System.err.println("[ChatStompController] principal is null — JWT expired or missing. roomId=" + roomId);
            return;
        }
        Long senderId = Long.parseLong(principal.getName());
        messageService.send(roomId, senderId, request.content(), request.replyToId());
    }

    /** 타이핑 이벤트 브로드캐스트 (DB 저장 없음) */
    @MessageMapping("/chat/{roomId}/typing")
    public void handleTyping(
            @DestinationVariable Long roomId,
            @Payload Map<String, Object> body,
            Principal principal
    ) {
        if (principal == null) return;
        Long userId = Long.parseLong(principal.getName());
        messagingTemplate.convertAndSend("/topic/room/" + roomId + "/typing",
                Map.of("userId", userId, "nickname", body.getOrDefault("nickname", "")));
    }
}
