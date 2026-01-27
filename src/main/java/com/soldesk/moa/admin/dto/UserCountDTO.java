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

    // 남성 유저 수
    private Long countMale;

    // 여성 유저 수
    private Long countFemale;

    // 남자 성비
    private double maleRatio;

    // 여자 성비
    private double femaleRatio;

    // 모임에 가입되어있는 유저 수
    private Long countJoinUser;
}
