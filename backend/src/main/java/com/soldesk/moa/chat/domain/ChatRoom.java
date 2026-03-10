package com.soldesk.moa.chat.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "chat_room", uniqueConstraints = {
        @UniqueConstraint(name = "uk_direct_key", columnNames = {"direct_key"}),
        @UniqueConstraint(name = "uk_circle_id",  columnNames = {"circle_id"})
})
public class ChatRoom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "room_type", nullable = false, length = 20)
    private RoomType type;

    /** 모임 채팅방 전용 (모임당 1개) */
    @Column(name = "circle_id")
    private Long circleId;

    /** 1:1 채팅방 전용 - "D:{smallerId}:{largerId}" */
    @Column(name = "direct_key", length = 50)
    private String directKey;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    protected ChatRoom() {}

    public static ChatRoom direct(String directKey) {
        ChatRoom r = new ChatRoom();
        r.type = RoomType.DIRECT;
        r.directKey = directKey;
        r.createdAt = LocalDateTime.now();
        return r;
    }

    public static ChatRoom group(Long circleId) {
        ChatRoom r = new ChatRoom();
        r.type = RoomType.GROUP;
        r.circleId = circleId;
        r.createdAt = LocalDateTime.now();
        return r;
    }

    public Long getId() { return id; }
    public RoomType getType() { return type; }
    public Long getCircleId() { return circleId; }
    public String getDirectKey() { return directKey; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
