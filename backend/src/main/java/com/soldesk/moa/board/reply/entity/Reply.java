package com.soldesk.moa.board.reply.entity;

import java.time.LocalDateTime;

import com.soldesk.moa.board.post.entity.Post;
import com.soldesk.moa.common.entity.BaseEntity;
import com.soldesk.moa.users.entity.Users;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@ToString(exclude = { "userId", "postId", "parentId" })
@Table
@Entity
public class Reply extends BaseEntity {

    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Id
    private Long replyId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private Post postId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private Users userId;

    @Column(nullable = false, length = 1000)
    private String content;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id", nullable = true)
    private Reply parentId;

    private int depth;

    // 기본값 false
    @Column(nullable = false)
    private boolean deleted;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    public void changeContent(String content) {
        this.content = content;
    }

    public void markDeleted(LocalDateTime deletedAt) {
        this.deleted = true;
        this.deletedAt = deletedAt;
    }

    public void restore() {
        this.deleted = false;
        this.deletedAt = null;
    }

}
