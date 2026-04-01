package com.soldesk.moa.chat.service;

import com.soldesk.moa.chat.domain.ChatMessage;
import com.soldesk.moa.chat.domain.ChatMessageReaction;
import com.soldesk.moa.chat.dto.response.ChatMessageResponse;
import com.soldesk.moa.chat.dto.response.UnreadCountResponse;
import com.soldesk.moa.chat.exception.ChatErrorCode;
import com.soldesk.moa.chat.exception.ChatException;
import com.soldesk.moa.chat.repository.ChatMessageReactionRepository;
import com.soldesk.moa.chat.repository.ChatMessageRepository;
import com.soldesk.moa.users.repository.UsersRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ChatMessageService {

    private final ChatRoomService roomService;
    private final ChatMessageRepository messageRepo;
    private final UsersRepository usersRepository;
    private final ChatNotificationDispatcher notificationDispatcher;
    private final SimpMessagingTemplate messagingTemplate;
    private final ChatMessageReactionRepository reactionRepo;

    public ChatMessageService(ChatRoomService roomService, ChatMessageRepository messageRepo,
                              UsersRepository usersRepository,
                              ChatNotificationDispatcher notificationDispatcher,
                              SimpMessagingTemplate messagingTemplate,
                              ChatMessageReactionRepository reactionRepo) {
        this.roomService = roomService;
        this.messageRepo = messageRepo;
        this.usersRepository = usersRepository;
        this.notificationDispatcher = notificationDispatcher;
        this.messagingTemplate = messagingTemplate;
        this.reactionRepo = reactionRepo;
    }

    /** 메시지 저장 후 응답 반환 (WebSocket / REST 공통) */
    @Transactional
    public ChatMessageResponse send(Long roomId, Long senderId, String content, Long replyToId) {
        if (content == null || content.isBlank()) {
            throw new ChatException(ChatErrorCode.MESSAGE_EMPTY, "메시지를 입력해주세요.");
        }
        roomService.getRoomOrThrow(roomId);
        roomService.assertMember(roomId, senderId);

        ChatMessage saved = messageRepo.save(ChatMessage.of(roomId, senderId, content, replyToId));
        ChatMessageResponse response = toResponse(saved, senderId, List.of());

        // 트랜잭션 커밋 전에 브로드캐스트 → 수신자에게 즉시 전달 (@SendTo 대체)
        messagingTemplate.convertAndSend("/topic/room/" + roomId, response);

        // 발신자 제외 채팅방 멤버들에게 알림 전송 (비동기 — 메시지 응답 속도에 영향 없도록)
        notificationDispatcher.dispatch(roomId, senderId, response.senderNickname(), content);

        return response;
    }

    /** 채팅 내역 페이징 조회 (최신순) */
    @Transactional(readOnly = true)
    public Page<ChatMessageResponse> getMessages(Long roomId, Long userId, int page, int size) {
        if (size <= 0 || size > 100) {
            throw new ChatException(ChatErrorCode.INVALID_REQUEST, "size는 1~100 사이여야 합니다.");
        }
        roomService.getRoomOrThrow(roomId);
        roomService.assertMember(roomId, userId);

        Page<ChatMessage> msgPage = messageRepo.findByRoomIdOrderByCreatedAtDesc(roomId, PageRequest.of(page, size));
        List<Long> ids = msgPage.getContent().stream().map(ChatMessage::getId).collect(Collectors.toList());
        Map<Long, List<ChatMessageReaction>> reactionMap = ids.isEmpty() ? Map.of()
                : reactionRepo.findByMessageIdIn(ids).stream().collect(Collectors.groupingBy(ChatMessageReaction::getMessageId));
        return msgPage.map(m -> toResponse(m, userId, reactionMap.getOrDefault(m.getId(), List.of())));
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
        List<ChatMessageReaction> reactions = reactionRepo.findByMessageId(messageId);
        return toResponse(message, userId, reactions);
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
        List<ChatMessageReaction> reactions = reactionRepo.findByMessageId(messageId);
        return toResponse(message, userId, reactions);
    }

    /** 리액션 토글 (추가/변경/취소) */
    @Transactional
    public ChatMessageResponse toggleReaction(Long messageId, Long userId, String emoji) {
        if (!emoji.equals("👍") && !emoji.equals("❤️")) {
            throw new ChatException(ChatErrorCode.INVALID_REQUEST, "지원하지 않는 리액션입니다.");
        }
        ChatMessage message = messageRepo.findById(messageId)
                .orElseThrow(() -> new ChatException(ChatErrorCode.INVALID_REQUEST, "메시지를 찾을 수 없습니다."));
        if (message.isDeleted()) {
            throw new ChatException(ChatErrorCode.INVALID_REQUEST, "삭제된 메시지에는 리액션할 수 없습니다.");
        }
        roomService.assertMember(message.getRoomId(), userId);

        reactionRepo.findByMessageIdAndUserId(messageId, userId).ifPresentOrElse(
                existing -> {
                    if (existing.getEmoji().equals(emoji)) {
                        reactionRepo.delete(existing);
                    } else {
                        reactionRepo.delete(existing);
                        reactionRepo.save(ChatMessageReaction.of(messageId, userId, emoji));
                    }
                },
                () -> reactionRepo.save(ChatMessageReaction.of(messageId, userId, emoji))
        );

        List<ChatMessageReaction> reactions = reactionRepo.findByMessageId(messageId);
        ChatMessageResponse response = toResponse(message, userId, reactions);
        messagingTemplate.convertAndSend("/topic/room/" + message.getRoomId() + "/reaction", response);
        return response;
    }

    // ─── private ──────────────────────────────────────────────

    private ChatMessageResponse toResponse(ChatMessage m, Long currentUserId, List<ChatMessageReaction> reactions) {
        String nickname = usersRepository.findById(m.getSenderId())
                .map(u -> u.getNickname())
                .orElse("알 수 없음");
        String replyToContent = null;
        String replyToNickname = null;
        if (m.getReplyToId() != null) {
            var orig = messageRepo.findById(m.getReplyToId());
            replyToContent = orig.map(o -> o.isDeleted() ? "삭제된 메시지" : o.getContent()).orElse(null);
            replyToNickname = orig.flatMap(o -> usersRepository.findById(o.getSenderId()))
                    .map(u -> u.getNickname()).orElse(null);
        }
        Map<String, List<ChatMessageReaction>> grouped = reactions.stream()
                .collect(Collectors.groupingBy(ChatMessageReaction::getEmoji));
        List<ChatMessageResponse.ReactionSummary> reactionSummaries = grouped.entrySet().stream()
                .map(e -> new ChatMessageResponse.ReactionSummary(
                        e.getKey(),
                        e.getValue().size(),
                        currentUserId != null && e.getValue().stream().anyMatch(r -> r.getUserId().equals(currentUserId))
                ))
                .collect(Collectors.toList());
        return new ChatMessageResponse(m.getId(), m.getRoomId(), m.getSenderId(), nickname,
                m.getContent(), m.getCreatedAt(), m.getUpdatedAt(), m.isDeleted(),
                m.getReplyToId(), replyToContent, replyToNickname, reactionSummaries);
    }
}
