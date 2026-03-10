package com.soldesk.moa.chat.controller;

import com.soldesk.moa.chat.domain.ChatRoom;
import com.soldesk.moa.chat.dto.response.ChatMessageResponse;
import com.soldesk.moa.chat.dto.response.UnreadCountResponse;
import com.soldesk.moa.chat.service.ChatMessageService;
import com.soldesk.moa.chat.service.ChatRoomService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 채팅 REST API.
 *
 * - 방 생성/조회
 * - 메시지 내역 페이징 조회
 * - 안읽은 메시지 수 조회
 * - 읽음 처리
 *
 * 임시: userId는 요청 파라미터로 수신 (인증 연동 후 Principal로 교체 예정)
 */
@RestController
@RequestMapping("/api/chat")
public class ChatRestController {

    private final ChatRoomService roomService;
    private final ChatMessageService messageService;

    public ChatRestController(ChatRoomService roomService, ChatMessageService messageService) {
        this.roomService = roomService;
        this.messageService = messageService;
    }

    /** 1:1 채팅방 조회 또는 생성 */
    @PostMapping("/rooms/direct")
    public ResponseEntity<Map<String, Long>> getOrCreateDirectRoom(
            @RequestParam Long myId,
            @RequestParam Long otherId
    ) {
        ChatRoom room = roomService.getOrCreateDirectRoom(myId, otherId);
        return ResponseEntity.ok(Map.of("roomId", room.getId()));
    }

    /** 모임 채팅방 조회 또는 생성 */
    @PostMapping("/rooms/group")
    public ResponseEntity<Map<String, Long>> getOrCreateGroupRoom(
            @RequestParam Long circleId,
            @RequestParam Long myId
    ) {
        ChatRoom room = roomService.getOrCreateGroupRoom(circleId, myId);
        return ResponseEntity.ok(Map.of("roomId", room.getId()));
    }

    /** 채팅 내역 조회 (최신순 페이징) */
    @GetMapping("/rooms/{roomId}/messages")
    public ResponseEntity<Page<ChatMessageResponse>> getMessages(
            @PathVariable Long roomId,
            @RequestParam Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(messageService.getMessages(roomId, userId, page, size));
    }

    /** 안읽은 메시지 수 조회 */
    @GetMapping("/rooms/{roomId}/unread")
    public ResponseEntity<UnreadCountResponse> getUnreadCount(
            @PathVariable Long roomId,
            @RequestParam Long userId
    ) {
        return ResponseEntity.ok(messageService.getUnreadCount(roomId, userId));
    }

    /** 읽음 처리 */
    @PostMapping("/rooms/{roomId}/read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable Long roomId,
            @RequestParam Long userId
    ) {
        roomService.markAsRead(roomId, userId);
        return ResponseEntity.ok().build();
    }
}
