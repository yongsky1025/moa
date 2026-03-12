package com.soldesk.moa.chat.service;

import com.soldesk.moa.chat.domain.ChatMessage;
import com.soldesk.moa.chat.dto.response.ChatMessageResponse;
import com.soldesk.moa.chat.dto.response.UnreadCountResponse;
import com.soldesk.moa.chat.exception.ChatErrorCode;
import com.soldesk.moa.chat.exception.ChatException;
import com.soldesk.moa.chat.repository.ChatMessageRepository;
import com.soldesk.moa.chat.repository.ChatRoomMemberRepository;
import com.soldesk.moa.notification.domain.NotificationType;
import com.soldesk.moa.notification.service.NotificationService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ChatMessageService {

    private final ChatRoomService roomService;
    private final ChatMessageRepository messageRepo;
    private final ChatRoomMemberRepository memberRepo;
    private final NotificationService notificationService;

    public ChatMessageService(ChatRoomService roomService, ChatMessageRepository messageRepo,
                              ChatRoomMemberRepository memberRepo, NotificationService notificationService) {
        this.roomService = roomService;
        this.messageRepo = messageRepo;
        this.memberRepo = memberRepo;
        this.notificationService = notificationService;
    }

    /** 메시지 저장 후 응답 반환 (WebSocket / REST 공통) */
    @Transactional
    public ChatMessageResponse send(Long roomId, Long senderId, String content) {
        if (content == null || content.isBlank()) {
            throw new ChatException(ChatErrorCode.MESSAGE_EMPTY, "메시지를 입력해주세요.");
        }
        roomService.getRoomOrThrow(roomId);
        roomService.assertMember(roomId, senderId);

        ChatMessage saved = messageRepo.save(ChatMessage.of(roomId, senderId, content));

        // 발신자 제외 채팅방 멤버들에게 알림 전송
        memberRepo.findByRoomId(roomId).stream()
                .filter(m -> !m.getUserId().equals(senderId))
                .forEach(m -> notificationService.send(
                        m.getUserId(),
                        NotificationType.CHAT_MESSAGE,
                        "새 메시지가 도착했습니다: " + content
                ));

        return toResponse(saved);
    }

    /** 채팅 내역 페이징 조회 (최신순) */
    @Transactional(readOnly = true)
    public Page<ChatMessageResponse> getMessages(Long roomId, Long userId, int page, int size) {
        if (size <= 0 || size > 100) {
            throw new ChatException(ChatErrorCode.INVALID_REQUEST, "size는 1~100 사이여야 합니다.");
        }
        roomService.getRoomOrThrow(roomId);
        roomService.assertMember(roomId, userId);

        return messageRepo.findByRoomIdOrderByCreatedAtDesc(roomId, PageRequest.of(page, size))
                .map(this::toResponse);
    }

    /** 안읽은 메시지 수 조회 */
    @Transactional(readOnly = true)
    public UnreadCountResponse getUnreadCount(Long roomId, Long userId) {
        roomService.getRoomOrThrow(roomId);
        var member = roomService.getMemberOrThrow(roomId, userId);
        long count = messageRepo.countByRoomIdAndCreatedAtAfter(roomId, member.getLastReadAt());
        return new UnreadCountResponse(roomId, userId, count);
    }

    // ─── private ──────────────────────────────────────────────

    private ChatMessageResponse toResponse(ChatMessage m) {
        return new ChatMessageResponse(m.getId(), m.getRoomId(), m.getSenderId(), m.getContent(), m.getCreatedAt());
    }
}
