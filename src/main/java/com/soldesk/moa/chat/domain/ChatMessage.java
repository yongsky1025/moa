package com.soldesk.moa.chat.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "chat_message",
        indexes = @Index(name = "idx_room_created", columnList = "room_id, created_at"))
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "room_id", nullable = false)
    private Long roomId;

    @Column(name = "sender_id", nullable = false)
    private Long senderId;

    @Column(nullable = false, length = 1000)
    private String content;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    protected ChatMessage() {}

    public static ChatMessage of(Long roomId, Long senderId, String content) {
        if (content == null || content.isBlank()) {
            throw new IllegalArgumentException("메시지는 비어있을 수 없습니다.");
        }
        ChatMessage m = new ChatMessage();
        m.roomId = roomId;
        m.senderId = senderId;
        m.content = content.trim();
        m.createdAt = LocalDateTime.now();
        return m;
    }

    public Long getId() { return id; }
    public Long getRoomId() { return roomId; }
    public Long getSenderId() { return senderId; }
    public String getContent() { return content; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
