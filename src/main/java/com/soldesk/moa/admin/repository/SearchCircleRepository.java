package com.soldesk.moa.admin.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.soldesk.moa.admin.dto.AdminCircleSearchDTO;

public interface SearchCircleRepository {

    // 특정 유저가 가입한 모임 조회
    Page<Object[]> getJoinCircleByUserId(Long userId, Pageable pageable);

    // 전체 모임 정보 조회(필터,검색)
    Page<Object[]> getCircleInfo(Pageable pageable, AdminCircleSearchDTO adminCircleSearchDTO);

}
