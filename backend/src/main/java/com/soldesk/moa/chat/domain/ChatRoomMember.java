package com.soldesk.moa.chat.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "chat_room_member",
        uniqueConstraints = @UniqueConstraint(name = "uk_room_user", columnNames = {"room_id", "user_id"}),
        indexes = {
                @Index(name = "idx_member_room", columnList = "room_id"),
                @Index(name = "idx_member_user", columnList = "user_id")
        })
public class ChatRoomMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "room_id", nullable = false)
    private Long roomId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "joined_at", nullable = false)
    private LocalDateTime joinedAt;

    /** 이 시각 이후의 메시지가 안읽은 메시지 */
    @Column(name = "last_read_at", nullable = false)
    private LocalDateTime lastReadAt;

    protected ChatRoomMember() {}

    public static ChatRoomMember join(Long roomId, Long userId) {
        ChatRoomMember m = new ChatRoomMember();
        m.roomId = roomId;
        m.userId = userId;
        m.joinedAt = LocalDateTime.now();
        m.lastReadAt = LocalDateTime.now();
        return m;
    }

    public void markAsRead() {
        this.lastReadAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public Long getRoomId() { return roomId; }
    public Long getUserId() { return userId; }
    public LocalDateTime getJoinedAt() { return joinedAt; }
    public LocalDateTime getLastReadAt() { return lastReadAt; }
}
