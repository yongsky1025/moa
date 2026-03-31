package com.soldesk.moa.post.entity;

import java.time.LocalDateTime;

import com.soldesk.moa.board.entity.Board;
import com.soldesk.moa.board.entity.constant.BoardType;
import com.soldesk.moa.board.entity.constant.CircleBoardKind;
import com.soldesk.moa.common.entity.BaseEntity;
import com.soldesk.moa.common.entity.Image;
import com.soldesk.moa.post.entity.constant.NoticeCategory;
import com.soldesk.moa.users.entity.Users;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
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
@ToString(exclude = { "userId", "boardId", "image" })
@Table
@Entity
public class Post extends BaseEntity {

    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Id
    private Long postId;

    @Column(nullable = false)
    private String title;

    @Lob
    @Column(nullable = false, columnDefinition = "LONGTEXT")
    private String content;

    @Builder.Default
    private int viewCount = 0;

    @Column(name = "like_count", nullable = false)
    @Builder.Default
    private int likeCount = 0;

    // 작성자
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private Users userId; // 작성자 불러옴

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "board_id", nullable = false)
    private Board boardId;

    @OneToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "image_id", nullable = true)
    private Image image;

    // 신고/제재용 컬럼추가(soft delete)
    @Column(nullable = false)
    @Builder.Default
    private boolean deleted = false;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private NoticeCategory noticeCategory;

    @Column(nullable = false)
    @Builder.Default
    private boolean pinned = false;

    @Column
    private LocalDateTime pinnedAt;

    @Column
    @Builder.Default
    private Boolean activityPublic = false;

    // setter
    // 수정용
    public void changeTitle(String title) {
        this.title = title;
    }

    public void changeContent(String content) {
        this.content = content;
    }

    public void changeImage(Image image) {
        this.image = image;
    }

    public void changeNoticeCategory(NoticeCategory noticeCategory) {
        this.noticeCategory = noticeCategory;
    }

    public void changePinned(boolean pinned) {
        this.pinned = pinned;
        this.pinnedAt = pinned ? LocalDateTime.now() : null;
    }

    public void changeActivityPublic(Boolean activityPublic) {
        this.activityPublic = Boolean.TRUE.equals(activityPublic);
    }

    public boolean isPublicCircleActivityPost() {
        return boardId != null
                && boardId.getBoardType() == BoardType.CIRCLE
                && boardId.getCircleBoardKind() == CircleBoardKind.ACTIVITY
                && Boolean.TRUE.equals(activityPublic);
    }

    // 신고/제재용 메소드 추가
    public void markDeleted() {
        this.deleted = true;
    }

    public void restore() {
        this.deleted = false;
    }

}
