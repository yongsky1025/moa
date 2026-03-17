package com.soldesk.moa.board.post.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class PostCardResponseDTO {
    private Long postId;
    private Long boardId;
    private String boardName;
    private String title;
    private String authorName;
    private String thumbnailImagePath;
    private LocalDateTime createDate;
    private int viewCount;
    private long replyCount;
}
