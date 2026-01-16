package com.soldesk.moa.admin.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.soldesk.moa.circle.entity.CircleMember;

public interface AdminCMRepository extends JpaRepository<CircleMember, Long> {

}
