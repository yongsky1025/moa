package com.soldesk.moa.admin.dashboard.dto.postInfo;

import com.soldesk.moa.post.entity.constant.NoticeCategory;
import lombok.Builder;

@Builder
public record AdminNoticeRequestDTO(
    String title,
    String content,
    NoticeCategory noticeCategory
) {}
