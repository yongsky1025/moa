package com.soldesk.moa.circle.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.soldesk.moa.circle.entity.CircleMember;

public interface CircleMemberRepository extends JpaRepository<CircleMember, Long> {
}
