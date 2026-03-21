package com.soldesk.moa.post.dto;

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

    private String authorPublicId;

    private int viewCount;

    private long replyCount;

    private LocalDateTime createDate;

    private LocalDateTime updateDate;
}
