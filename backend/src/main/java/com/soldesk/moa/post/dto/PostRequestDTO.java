package com.soldesk.moa.post.dto;

import com.soldesk.moa.post.entity.constant.NoticeCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
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
public class PostRequestDTO {

    @NotBlank
    @Size(min = 2, max = 80, message = "제목은 2자 이상 80자 이하여야 합니다.")
    private String title;

    @NotBlank
    private String content;

    private NoticeCategory noticeCategory;

    // 모임활동 게시글일 때만 유효
    private Boolean activityPublic;
}
