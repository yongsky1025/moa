package com.soldesk.moa.schedule.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.soldesk.moa.schedule.entity.Schedule;
import com.soldesk.moa.schedule.entity.ScheduleTag;

public interface ScheduleTagRepository extends JpaRepository<ScheduleTag, Long> {

    List<ScheduleTag> findAllBySchedule(Schedule schedule);

    void deleteAllBySchedule(Schedule schedule);
}
