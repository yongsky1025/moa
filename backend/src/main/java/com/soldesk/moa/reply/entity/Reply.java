package com.soldesk.moa.reply.entity;

import com.soldesk.moa.common.entity.BaseEntity;
import com.soldesk.moa.post.entity.Post;
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
@ToString(exclude = { "userId", "postId", "parentId", "replyToUserId" })
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

    @Column(name = "like_count", nullable = false)
    @Builder.Default
    private int likeCount = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id", nullable = true)
    private Reply parentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reply_to_user_id")
    private Users replyToUserId;

    @Column(nullable = false)
    @Builder.Default
    private int depth = 0;

    // 기본값 false
    @Column(nullable = false)
    @Builder.Default
    private boolean deleted = false;

    public void changeContent(String content) {
        this.content = content;
    }

    public void markDeleted() {
        this.deleted = true;
    }

    // 신고/제재용 메소드 추가 - admin
    public void restore() {
        this.deleted = false;
    }

}
