package com.soldesk.moa.admin.dto;

import groovy.transform.ToString;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@SuperBuilder
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class UserCountDTO {

    // 전체 유저 수
    private Long countTotalUser;

    // 성별
    private Long maleUser;
    private Long femaleUser;

    // 성비
    private double maleRatio;
    private double femaleRatio;

    // 모임에 가입되어있는 유저 수
    private Long countJoinUser;
}
