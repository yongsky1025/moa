package com.soldesk.moa.schedule.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.soldesk.moa.schedule.entity.ScheduleMember;

public interface ScheduleMemberRepository extends JpaRepository<ScheduleMember, Long> {
}
