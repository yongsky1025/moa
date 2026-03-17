package com.soldesk.moa.board.post.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Builder
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class PostResponseDTO {

    private Long boardId;

    private Long postId;

    private String title;

    private String content;

    private String authorName;

    private int viewCount;

    private long replyCount;

    private String thumbnailImagePath;

    private LocalDateTime createDate;

    private LocalDateTime updateDate;
}
