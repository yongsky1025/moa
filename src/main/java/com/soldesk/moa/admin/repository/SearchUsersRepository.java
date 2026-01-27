package com.soldesk.moa.admin.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.soldesk.moa.users.entity.Users;

public interface SearchUsersRepository {

    // 기간별 가입자 수 조회 (기간 검색)
    Long getSignUpCount(LocalDateTime start, LocalDateTime end);

    // 월별 가입자 수 조회
    List<Object[]> getCountCreateUserByDate();

    // 연령대별 유저 수 & 성비 조회(탈퇴자x)
    List<Object[]> getAgeGroup();

    // 전체 유저 정보 조회(검색,필터)
    Page<Users> getUsersInfo(Pageable pageable, String type, String keyword);
}
