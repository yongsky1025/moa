package com.soldesk.moa.admin.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.soldesk.moa.schedule.entity.ScheduleMember;

public interface AdminScheduleMemberRepository extends JpaRepository<ScheduleMember, Long> {

}
