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
public class UserInfoPostDTO {
    private String boardName;
    private String title;
    private String content;
    private Long viewCount;
    private LocalDateTime createDate;
    private Long countReply;
}
