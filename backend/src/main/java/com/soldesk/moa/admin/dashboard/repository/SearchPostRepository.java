package com.soldesk.moa.admin.dashboard.repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.querydsl.core.Tuple;

public interface SearchPostRepository {

    Page<Object[]> searchBoardListByUserId(Long userId, Pageable pageable);

    // 주간 일별 게시글 수(날짜, 카운트)
    List<Tuple> countPostsGroupedByDay(LocalDate from);

    // 시간대별 활동량 - 게시글(생성)
    List<Object[]> findPostActivity(LocalDateTime since);
}
