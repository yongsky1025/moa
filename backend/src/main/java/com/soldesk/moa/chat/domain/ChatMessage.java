package com.soldesk.moa.chat.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "chat_message", indexes = @Index(name = "idx_room_created", columnList = "room_id, created_at"))
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

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "is_deleted", nullable = false)
    private boolean isDeleted = false;

    @Column(name = "reply_to_id")
    private Long replyToId;

    @Column(name = "is_pinned", nullable = false)
    private boolean isPinned = false;

    @Column(name = "is_reported", nullable = false)
    private boolean isReported = false;

    protected ChatMessage() {
    }

    public static ChatMessage of(Long roomId, Long senderId, String content, Long replyToId) {
        if (content == null || content.isBlank()) {
            throw new IllegalArgumentException("메시지는 비어있을 수 없습니다.");
        }
        ChatMessage m = new ChatMessage();
        m.roomId = roomId;
        m.senderId = senderId;
        m.content = content.trim();
        m.createdAt = LocalDateTime.now();
        m.isDeleted = false;
        m.replyToId = replyToId;
        return m;
    }

    public void edit(String newContent) {
        if (newContent == null || newContent.isBlank()) {
            throw new IllegalArgumentException("메시지는 비어있을 수 없습니다.");
        }
        this.content = newContent.trim();
        this.updatedAt = LocalDateTime.now();
    }

    public void softDelete() {
        this.isDeleted = true;
        this.updatedAt = LocalDateTime.now();
    }

    // 채팅 신고용
    public void markReported() {
        this.isDeleted = true;
        this.isReported = true;
        this.updatedAt = LocalDateTime.now();
    }

    // 채팅 신고용
    public void restore() {
        this.isDeleted = false;
        this.isReported = false;
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public Long getRoomId() {
        return roomId;
    }

    public Long getSenderId() {
        return senderId;
    }

    public String getContent() {
        return content;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public boolean isDeleted() {
        return isDeleted;
    }

    public boolean isReported() {
        return isReported;
    }

    public Long getReplyToId() {
        return replyToId;
    }
}
