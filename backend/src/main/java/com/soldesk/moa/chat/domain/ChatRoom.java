package com.soldesk.moa.chat.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "chat_room", uniqueConstraints = {
        @UniqueConstraint(name = "uk_direct_key",   columnNames = {"direct_key"}),
        @UniqueConstraint(name = "uk_circle_id",    columnNames = {"circle_id"}),
        @UniqueConstraint(name = "uk_schedule_id",  columnNames = {"schedule_id"})
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

    /** 일정 채팅방 전용 (일정당 1개) */
    @Column(name = "schedule_id")
    private Long scheduleId;

    /** 모임/일정 채팅방 사용자 지정 이름 (null이면 기본값 사용) */
    @Column(name = "room_name", length = 100)
    private String name;

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

    public static ChatRoom group(Long circleId, String name) {
        ChatRoom r = new ChatRoom();
        r.type = RoomType.GROUP;
        r.circleId = circleId;
        r.name = name;
        r.createdAt = LocalDateTime.now();
        return r;
    }

    public static ChatRoom schedule(Long scheduleId, String name) {
        ChatRoom r = new ChatRoom();
        r.type = RoomType.SCHEDULE;
        r.scheduleId = scheduleId;
        r.name = name;
        r.createdAt = LocalDateTime.now();
        return r;
    }

    public Long getId() { return id; }
    public RoomType getType() { return type; }
    public Long getCircleId() { return circleId; }
    public Long getScheduleId() { return scheduleId; }
    public String getDirectKey() { return directKey; }
    public String getName() { return name; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    public void updateName(String name) { this.name = name; }

    /** 공지 메시지 ID (null이면 공지 없음) */
    @Column(name = "notice_message_id")
    private Long noticeMessageId;

    /** 공지 메시지 내용 스냅샷 (최대 500자) */
    @Column(name = "notice_content", length = 500)
    private String noticeContent;

    public Long getNoticeMessageId() { return noticeMessageId; }
    public String getNoticeContent() { return noticeContent; }

    public void setNotice(Long messageId, String content) {
        this.noticeMessageId = messageId;
        this.noticeContent = content != null && content.length() > 500 ? content.substring(0, 500) : content;
    }

    public void clearNotice() {
        this.noticeMessageId = null;
        this.noticeContent = null;
    }
}
