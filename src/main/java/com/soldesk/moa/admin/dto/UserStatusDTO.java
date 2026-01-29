package com.soldesk.moa.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class UserStatusDTO {

    // 기준 년/월
    private Long year;
    private Long month;

    // 몇 일 기준 가입/탈퇴자 조회용
    private Long date;

    // 가입 , 탈퇴 수
    private Long signUpCount;
    private Long withdrawnCount;
}
