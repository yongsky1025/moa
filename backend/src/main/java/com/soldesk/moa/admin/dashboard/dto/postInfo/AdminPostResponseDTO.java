package com.soldesk.moa.admin.dashboard.dto.postInfo;

import java.time.LocalDateTime;

import com.soldesk.moa.board.entity.constant.BoardType;
import com.soldesk.moa.post.entity.constant.NoticeCategory;

import lombok.Builder;

@Builder
public record AdminPostResponseDTO(
    Long postId,
    String title,
    String authorName,
    Long authorId,
    String boardName,       // 게시판 이름 (자유게시판, 공지사항 등)
    BoardType boardType,
    String circleName,      // CIRCLE 타입일 때 동아리 이름
    Long circleId,          // CIRCLE 타입일 때 동아리 ID
    int viewCount,
    long replyCount,
    NoticeCategory noticeCategory,
    boolean deleted,
    LocalDateTime createDate
) {}
