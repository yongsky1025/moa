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

    /** 즐겨찾기(고정) 여부 */
    @Column(name = "is_pinned", nullable = false)
    private boolean isPinned = false;

    protected ChatRoomMember() {}

    public static ChatRoomMember join(Long roomId, Long userId) {
        ChatRoomMember m = new ChatRoomMember();
        m.roomId = roomId;
        m.userId = userId;
        m.joinedAt = LocalDateTime.now();
        m.lastReadAt = LocalDateTime.now();
        return m;
    }

    /** 기존 방에 자동 추가(마이그레이션)용 — lastReadAt을 과거로 설정해 기존 메시지가 안읽음으로 집계됨 */
    public static ChatRoomMember joinMigration(Long roomId, Long userId) {
        ChatRoomMember m = new ChatRoomMember();
        m.roomId = roomId;
        m.userId = userId;
        m.joinedAt = LocalDateTime.now();
        m.lastReadAt = LocalDateTime.of(2000, 1, 1, 0, 0);
        return m;
    }

    public void markAsRead() {
        this.lastReadAt = LocalDateTime.now();
    }

    public void togglePin() { this.isPinned = !this.isPinned; }

    public Long getId() { return id; }
    public Long getRoomId() { return roomId; }
    public Long getUserId() { return userId; }
    public LocalDateTime getJoinedAt() { return joinedAt; }
    public LocalDateTime getLastReadAt() { return lastReadAt; }
    public boolean isPinned() { return isPinned; }
}
