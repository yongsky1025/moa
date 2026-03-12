package com.soldesk.moa.admin.dashboard.repository;

import java.time.LocalDateTime;
import java.util.List;

public interface SearchScheduleRepository {

    // 시간대별 활동량 - 일정(시작기준)
    List<Object[]> findScheduleStartActivity(LocalDateTime since);

}
