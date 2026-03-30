package com.soldesk.moa.post.dto;

import java.time.LocalDateTime;

import com.soldesk.moa.board.entity.constant.BoardType;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PostSearchHitDTO {

    private String id;
    private Long postId;
    private Long boardId;
    private BoardType boardType;
    private Long circleId;
    private String title;
    private String content;
    private String authorName;
    private String authorPublicId;
    private int viewCount;
    private int likeCount;
    private long replyCount;
    private LocalDateTime createDate;
    private LocalDateTime updateDate;
}

