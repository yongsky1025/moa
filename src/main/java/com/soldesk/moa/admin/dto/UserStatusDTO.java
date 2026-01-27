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

    private Long signUpYear;

    private Long signUpMonth;

    // 몇 일 기준 가입/탈퇴자 조회용
    private Long date;

    private Long withdrawYear;

    private Long withdrawMonth;

    private Long signUpCount;

    private Long withdrawnCount;
}
