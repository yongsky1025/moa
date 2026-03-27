package com.soldesk.moa.admin.dashboard.dto.postInfo;

import java.time.LocalDateTime;
import java.util.List;

import com.soldesk.moa.board.entity.constant.BoardType;
import com.soldesk.moa.post.entity.constant.NoticeCategory;

import lombok.Builder;

@Builder
public record AdminPostDetailDTO(
    Long postId,
    String title,
    String content,
    String authorName,
    Long authorId,
    String boardName,
    BoardType boardType,
    String circleName,
    Long circleId,
    Long boardId,
    int viewCount,
    NoticeCategory noticeCategory,
    boolean deleted,
    Long sanctionId,
    LocalDateTime createDate,
    LocalDateTime updateDate,
    List<AdminReplyDTO> replies
) {

    @Builder
    public record AdminReplyDTO(
        Long replyId,
        String content,
        String authorName,
        Long authorId,
        Long parentId,
        int depth,
        boolean deleted,
        LocalDateTime createDate
    ) {}
}
