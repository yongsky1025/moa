package com.soldesk.moa.admin.dashboard.dto.userInfo;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserInfoReplyDTO {
    private Long postId;
    private String boardType;
    private Long boardId;
    private Long circleId;
    private String title;
    private String content;
    private LocalDateTime createDate;
}
