package com.soldesk.moa.admin.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.soldesk.moa.circle.entity.Circle;

public interface AdminCircleRepository extends JpaRepository<Circle, Long> {

}
