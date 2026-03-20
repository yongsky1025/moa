package com.soldesk.moa.chat.controller;

import com.soldesk.moa.auth.dto.AuthUserDTO;
import com.soldesk.moa.chat.domain.ChatRoom;
import com.soldesk.moa.chat.dto.response.ChatMessageResponse;
import com.soldesk.moa.chat.dto.response.ChatRoomSummaryResponse;
import com.soldesk.moa.chat.dto.response.UnreadCountResponse;
import com.soldesk.moa.chat.service.ChatMessageService;
import com.soldesk.moa.chat.service.ChatRoomService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 채팅 REST API.
 *
 * - 방 생성/조회
 * - 메시지 내역 페이징 조회
 * - 안읽은 메시지 수 조회
 * - 읽음 처리
 *
 * userId는 JWT 토큰에서 추출한 AuthUserDTO를 통해 가져옴 (URL 파라미터 위장 방지)
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

    /** 내가 참여 중인 채팅방 목록 조회 */
    @GetMapping("/rooms/my")
    public ResponseEntity<List<ChatRoomSummaryResponse>> getMyRooms(
            @AuthenticationPrincipal AuthUserDTO auth
    ) {
        return ResponseEntity.ok(roomService.getMyRooms(auth.getUserId()));
    }

    /** 1:1 채팅방 조회 또는 생성 */
    @PostMapping("/rooms/direct")
    public ResponseEntity<Map<String, Long>> getOrCreateDirectRoom(
            @AuthenticationPrincipal AuthUserDTO auth,
            @RequestParam Long otherId
    ) {
        ChatRoom room = roomService.getOrCreateDirectRoom(auth.getUserId(), otherId);
        return ResponseEntity.ok(Map.of("roomId", room.getId()));
    }

    /** 모임 채팅방 조회 또는 생성 */
    @PostMapping("/rooms/group")
    public ResponseEntity<Map<String, Long>> getOrCreateGroupRoom(
            @RequestParam Long circleId,
            @AuthenticationPrincipal AuthUserDTO auth
    ) {
        ChatRoom room = roomService.getOrCreateGroupRoom(circleId, auth.getUserId());
        return ResponseEntity.ok(Map.of("roomId", room.getId()));
    }

    /** 채팅 내역 조회 (최신순 페이징) */
    @GetMapping("/rooms/{roomId}/messages")
    public ResponseEntity<Page<ChatMessageResponse>> getMessages(
            @PathVariable Long roomId,
            @AuthenticationPrincipal AuthUserDTO auth,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(messageService.getMessages(roomId, auth.getUserId(), page, size));
    }

    /** 안읽은 메시지 수 조회 */
    @GetMapping("/rooms/{roomId}/unread")
    public ResponseEntity<UnreadCountResponse> getUnreadCount(
            @PathVariable Long roomId,
            @AuthenticationPrincipal AuthUserDTO auth
    ) {
        return ResponseEntity.ok(messageService.getUnreadCount(roomId, auth.getUserId()));
    }

    /** 전체 안읽은 메시지 수 (채팅 아이콘 배지용) */
    @GetMapping("/unread/total")
    public ResponseEntity<Map<String, Long>> getTotalUnread(
            @AuthenticationPrincipal AuthUserDTO auth
    ) {
        long total = roomService.getTotalUnreadCount(auth.getUserId());
        return ResponseEntity.ok(Map.of("totalUnread", total));
    }

    /** 모임 채팅방 이름 변경 */
    @PatchMapping("/rooms/{roomId}/name")
    public ResponseEntity<Void> updateRoomName(
            @PathVariable Long roomId,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal AuthUserDTO auth
    ) {
        roomService.updateRoomName(roomId, auth.getUserId(), body.get("name"));
        return ResponseEntity.ok().build();
    }

    /** 채팅방 나가기 */
    @DeleteMapping("/rooms/{roomId}/leave")
    public ResponseEntity<Void> leaveRoom(
            @PathVariable Long roomId,
            @AuthenticationPrincipal AuthUserDTO auth
    ) {
        roomService.leaveRoom(roomId, auth.getUserId());
        return ResponseEntity.noContent().build();
    }

    /** 읽음 처리 */
    @PostMapping("/rooms/{roomId}/read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable Long roomId,
            @AuthenticationPrincipal AuthUserDTO auth
    ) {
        roomService.markAsRead(roomId, auth.getUserId());
        return ResponseEntity.ok().build();
    }

    /** 메시지 수정 (본인만) */
    @PatchMapping("/messages/{messageId}")
    public ResponseEntity<ChatMessageResponse> editMessage(
            @PathVariable Long messageId,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal AuthUserDTO auth
    ) {
        return ResponseEntity.ok(messageService.editMessage(messageId, auth.getUserId(), body.get("content")));
    }

    /** 메시지 삭제 (본인만, 소프트 삭제) */
    @DeleteMapping("/messages/{messageId}")
    public ResponseEntity<ChatMessageResponse> deleteMessage(
            @PathVariable Long messageId,
            @AuthenticationPrincipal AuthUserDTO auth
    ) {
        return ResponseEntity.ok(messageService.deleteMessage(messageId, auth.getUserId()));
    }
}
