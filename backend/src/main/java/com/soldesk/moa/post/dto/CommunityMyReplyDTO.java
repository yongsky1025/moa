package com.soldesk.moa.post.dto;

import java.time.LocalDateTime;

import com.soldesk.moa.board.entity.constant.BoardType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Builder
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class CommunityMyReplyDTO {
    private Long replyId;
    private String content;
    private int likeCount;
    private LocalDateTime createDate;
    private Long postId;
    private String postTitle;
    private Long boardId;
    private String boardName;
    private BoardType boardType;
}
