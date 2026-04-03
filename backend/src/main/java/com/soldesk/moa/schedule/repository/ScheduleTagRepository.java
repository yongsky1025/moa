package com.soldesk.moa.schedule.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.soldesk.moa.schedule.entity.Schedule;
import com.soldesk.moa.schedule.entity.ScheduleTag;

public interface ScheduleTagRepository extends JpaRepository<ScheduleTag, Long> {

    List<ScheduleTag> findAllBySchedule(Schedule schedule);

    void deleteAllBySchedule(Schedule schedule);

    // 여러 일정의 태그를 한 번에 조회 (N+1 방지용)
    @Query("SELECT st FROM ScheduleTag st JOIN FETCH st.tag WHERE st.schedule IN :schedules")
    List<ScheduleTag> findAllByScheduleIn(@Param("schedules") List<Schedule> schedules);
}
