package com.soldesk.moa.admin.dto;

import java.util.ArrayList;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

// admin 메인 페이지 dto
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminMainDTO {

    // 유저 수 관련 (전체, 성비, 가입수, 탈퇴수)
    private UserCountDTO userCountDTO;

    // 가입, 탈퇴자 관련
    private UserStatusDTO userStatusDTO;

    // 모임 관련
    @Builder.Default
    private List<CircleDataDTO> circleDataDTOs = new ArrayList<>();

    // 총 모임 개수
    private Long circleCount;

}
