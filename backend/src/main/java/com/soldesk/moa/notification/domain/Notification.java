package com.soldesk.moa.notification.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notification")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;

    @Column(nullable = false)
    private String message;

    @Column(name = "is_read", nullable = false)
    private boolean isRead = false;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "reference_id")
    private Long referenceId;

    protected Notification() {}

    public static Notification of(Long userId, NotificationType type, String message) {
        Notification n = new Notification();
        n.userId = userId;
        n.type = type;
        n.message = message;
        n.isRead = false;
        n.createdAt = LocalDateTime.now();
        return n;
    }

    public static Notification of(Long userId, NotificationType type, String message, Long referenceId) {
        Notification n = of(userId, type, message);
        n.referenceId = referenceId;
        return n;
    }

    public void markRead() { this.isRead = true; }

    public Long getId() { return id; }
    public Long getUserId() { return userId; }
    public NotificationType getType() { return type; }
    public String getMessage() { return message; }
    public boolean isRead() { return isRead; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public Long getReferenceId() { return referenceId; }
}
