package com.soldesk.moa.chat.controller;

import com.soldesk.moa.auth.dto.AuthUserDTO;
import com.soldesk.moa.chat.service.AiChatService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * AI 스마트 답변 API
 * POST /api/ai/chat/rooms/{roomId}/suggest → 빠른 답변 3개 + 답변 초안 반환
 */
@RestController
@RequestMapping("/api/ai/chat")
public class AiChatController {

    private final AiChatService aiChatService;

    public AiChatController(AiChatService aiChatService) {
        this.aiChatService = aiChatService;
    }

    @PostMapping("/rooms/{roomId}/suggest")
    public ResponseEntity<Map<String, Object>> suggest(
            @PathVariable Long roomId,
            @AuthenticationPrincipal AuthUserDTO auth
    ) {
        Map<String, Object> result = aiChatService.suggest(roomId, auth.getUserId());
        return ResponseEntity.ok(result);
    }
}
