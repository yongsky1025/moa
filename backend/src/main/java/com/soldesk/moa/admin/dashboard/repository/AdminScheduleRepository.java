package com.soldesk.moa.admin.dashboard.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.soldesk.moa.schedule.entity.Schedule;

public interface AdminScheduleRepository extends JpaRepository<Schedule, Long> {

}
