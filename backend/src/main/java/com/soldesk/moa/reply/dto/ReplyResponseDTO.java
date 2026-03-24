package com.soldesk.moa.reply.dto;

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
public class ReplyResponseDTO {

    private Long replyId;

    private String content;

    private String authorName;

    private String authorPublicId;

    private Long authorUserId;

    private LocalDateTime createDate;

    private Long parentId;

    private int depth;

    private Long replyToUserId;

    private boolean deleted;

    private int likeCount;

    private String myReaction;

    private long replyCount;

}
