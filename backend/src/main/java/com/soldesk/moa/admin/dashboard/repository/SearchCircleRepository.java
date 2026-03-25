package com.soldesk.moa.admin.dashboard.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.soldesk.moa.admin.dashboard.dto.circleInfo.AdminCircleSearchDTO;

public interface SearchCircleRepository {

    // 특정 유저가 가입한 모임 조회
    Page<Object[]> getJoinCircleByUserId(Long userId, Pageable pageable);

    // 전체 모임 정보 조회(필터,검색)
    Page<Object[]> getCircleInfo(Pageable pageable, AdminCircleSearchDTO adminCircleSearchDTO);

    // 인기모임 top5(인원, 최근 일정 수, 최근 가입자 수 기반 점수/7일)
    List<Object[]> findPopularCircles(LocalDateTime since, int limit);

    // 모임 생존률
    Long countTotalCircle();

    // 성숙(30일+) 모임 중 최근 30일 내 일정이 없는 비활성 모임 수
    Long countInactiveMatureCircle(LocalDateTime maturityThreshold, LocalDateTime activityThreshold);

    // 시간대별 활동량 - 모임(생성)
    List<Object[]> findCircleCreateActivity(LocalDateTime since);

    // 모임 상세 조회
    Object[] getCircleDetail(Long circleId);

    // 모임 가입 회원 목록
    Page<Object[]> getCircleMembers(Long circleId, Pageable pageable);

    // 모임 최근 게시물
    Page<Object[]> getCirclePosts(Long circleId, Pageable pageable);
}
