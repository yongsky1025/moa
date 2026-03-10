package com.soldesk.moa.chat.controller;

import com.soldesk.moa.chat.dto.request.SendMessageRequest;
import com.soldesk.moa.chat.dto.response.ChatMessageResponse;
import com.soldesk.moa.chat.service.ChatMessageService;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import java.security.Principal;

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

    public ChatStompController(ChatMessageService messageService) {
        this.messageService = messageService;
    }

    @MessageMapping("/chat/{roomId}")
    @SendTo("/topic/room/{roomId}")
    public ChatMessageResponse handleMessage(
            @DestinationVariable Long roomId,
            SendMessageRequest request,
            Principal principal
    ) {
        Long senderId = Long.parseLong(principal.getName());
        return messageService.send(roomId, senderId, request.content());
    }
}
