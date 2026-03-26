package com.soldesk.moa.post.entity;

import java.time.LocalDateTime;

import com.soldesk.moa.board.entity.constant.BoardType;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "post_search")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostSearchEntity {

    @Id
    @Column(name = "post_id")
    private Long postId;

    @Column(name = "board_id", nullable = false)
    private Long boardId;

    @Enumerated(EnumType.STRING)
    @Column(name = "board_type", nullable = false, length = 20)
    private BoardType boardType;

    @Column(name = "circle_id")
    private Long circleId;

    @Column(nullable = false)
    private String title;

    @Column(name = "title_chosung", nullable = false)
    private String titleChosung;

    @Lob
    @Column(nullable = false)
    private String content;

    @Lob
    @Column(name = "content_chosung", nullable = false)
    private String contentChosung;

    @Column(name = "author_name", nullable = false)
    private String authorName;

    @Column(name = "author_name_chosung", nullable = false)
    private String authorNameChosung;

    @Column(name = "author_public_id", nullable = false)
    private String authorPublicId;

    @Column(name = "view_count", nullable = false)
    private int viewCount;

    @Column(name = "like_count", nullable = false)
    private int likeCount;

    @Column(name = "create_date", nullable = false)
    private LocalDateTime createDate;

    @Column(name = "update_date", nullable = false)
    private LocalDateTime updateDate;
}
