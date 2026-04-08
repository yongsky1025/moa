package com.soldesk.moa.admin.report.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.soldesk.moa.admin.report.entity.constant.ReportTargetType;

import lombok.Builder;

@Builder
public record ReportTargetContentDTO(
        ReportTargetType targetType,
        long targetId,
        boolean deleted,
        String linkUrl,

        // POST
        String postTitle,
        String postContent,
        String postAuthorName,
        Long postAuthorId,
        Long postBoardId,
        LocalDateTime postCreatedAt,

        // REPLY
        String replyContent,
        String replyAuthorName,
        Long replyAuthorId,
        Long replyPostId,
        String replyPostTitle,
        LocalDateTime replyCreatedAt,

        // CIRCLE
        String circleName,
        String circleDescription,
        String circleStatus,
        int circleMaxMember,
        int circleCurrentMember,
        Long circleLeaderId,
        LocalDateTime circleCreatedAt,

        // USER
        String userNickname,
        String userEmail,
        String userStatus,
        int userSanctionCount,
        List<UserRecentActivityDTO> userRecentActivities,

        // PLACE_REVIEW
        String placeReviewContent,
        Integer placeReviewRating,
        String placeReviewAuthorName,
        Long placeReviewAuthorId,
        String placeReviewPlaceName,
        Long placeReviewPlaceId,
        LocalDateTime placeReviewCreatedAt,

        // CHAT
        String chatContent,
        String chatSenderName,
        Long chatSenderUserId,
        Long chatRoomId,
        String chatRoomType,
        LocalDateTime chatCreatedAt) {

    @Builder
    public record UserRecentActivityDTO(
            String type,
            long id,
            String title,
            String content,
            LocalDateTime createdAt) {
    }
}
