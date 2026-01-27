package com.soldesk.moa.circle.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.soldesk.moa.circle.entity.Circle;

public interface CircleRepository extends JpaRepository<Circle, Long>, CircleRepositoryCustom {
}
