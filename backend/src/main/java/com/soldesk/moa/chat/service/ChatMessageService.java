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
import com.soldesk.moa.users.repository.UsersRepository;
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
    private final UsersRepository usersRepository;

    public ChatMessageService(ChatRoomService roomService, ChatMessageRepository messageRepo,
                              ChatRoomMemberRepository memberRepo, NotificationService notificationService,
                              UsersRepository usersRepository) {
        this.roomService = roomService;
        this.messageRepo = messageRepo;
        this.memberRepo = memberRepo;
        this.notificationService = notificationService;
        this.usersRepository = usersRepository;
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

    /** 메시지 수정 (본인만 가능) */
    @Transactional
    public ChatMessageResponse editMessage(Long messageId, Long userId, String newContent) {
        ChatMessage message = messageRepo.findById(messageId)
                .orElseThrow(() -> new ChatException(ChatErrorCode.INVALID_REQUEST, "메시지를 찾을 수 없습니다."));

        if (!message.getSenderId().equals(userId)) {
            throw new ChatException(ChatErrorCode.FORBIDDEN, "본인 메시지만 수정할 수 있습니다.");
        }
        if (message.isDeleted()) {
            throw new ChatException(ChatErrorCode.INVALID_REQUEST, "삭제된 메시지는 수정할 수 없습니다.");
        }

        message.edit(newContent);
        return toResponse(message);
    }

    /** 메시지 삭제 (본인만 가능, 소프트 삭제) */
    @Transactional
    public ChatMessageResponse deleteMessage(Long messageId, Long userId) {
        ChatMessage message = messageRepo.findById(messageId)
                .orElseThrow(() -> new ChatException(ChatErrorCode.INVALID_REQUEST, "메시지를 찾을 수 없습니다."));

        if (!message.getSenderId().equals(userId)) {
            throw new ChatException(ChatErrorCode.FORBIDDEN, "본인 메시지만 삭제할 수 있습니다.");
        }

        message.softDelete();
        return toResponse(message);
    }

    // ─── private ──────────────────────────────────────────────

    private ChatMessageResponse toResponse(ChatMessage m) {
        String nickname = usersRepository.findById(m.getSenderId())
                .map(u -> u.getNickname())
                .orElse("알 수 없음");
        return new ChatMessageResponse(m.getId(), m.getRoomId(), m.getSenderId(), nickname,
                m.getContent(), m.getCreatedAt(), m.getUpdatedAt(), m.isDeleted());
    }
}
