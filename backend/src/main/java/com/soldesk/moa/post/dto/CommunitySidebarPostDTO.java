package com.soldesk.moa.post.dto;

import java.time.LocalDateTime;

import com.soldesk.moa.board.entity.constant.BoardType;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CommunitySidebarPostDTO {

    private Long postId;
    private BoardType boardType;
    private String title;
    private int viewCount;
    private long replyCount;
    private LocalDateTime createDate;
}
