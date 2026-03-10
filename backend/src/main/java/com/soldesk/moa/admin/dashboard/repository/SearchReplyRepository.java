package com.soldesk.moa.admin.dashboard.repository;

import java.time.LocalDate;
import java.util.List;

import com.querydsl.core.Tuple;

public interface SearchReplyRepository {

    // 일주일 간 요일별 댓글 수
    List<Tuple> countRepliesGroupedByDay(LocalDate from);
}
