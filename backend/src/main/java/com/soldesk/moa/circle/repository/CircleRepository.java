package com.soldesk.moa.circle.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.soldesk.moa.circle.entity.Circle;
import com.soldesk.moa.circle.entity.constant.CircleStatus;

public interface CircleRepository extends JpaRepository<Circle, Long>, CircleRepositoryCustom {

    List<Circle> findByStatus(CircleStatus status);
}