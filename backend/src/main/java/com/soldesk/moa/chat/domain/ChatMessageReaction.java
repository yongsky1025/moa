package com.soldesk.moa.chat.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "chat_message_reaction",
        uniqueConstraints = @UniqueConstraint(name = "uk_msg_reaction_user", columnNames = {"message_id", "user_id"}))
public class ChatMessageReaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "message_id", nullable = false)
    private Long messageId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false, length = 10)
    private String emoji;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    protected ChatMessageReaction() {}

    public static ChatMessageReaction of(Long messageId, Long userId, String emoji) {
        ChatMessageReaction r = new ChatMessageReaction();
        r.messageId = messageId;
        r.userId = userId;
        r.emoji = emoji;
        r.createdAt = LocalDateTime.now();
        return r;
    }

    public Long getId() { return id; }
    public Long getMessageId() { return messageId; }
    public Long getUserId() { return userId; }
    public String getEmoji() { return emoji; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
