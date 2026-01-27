package com.soldesk.moa.circle.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.soldesk.moa.circle.entity.CircleCategory;

public interface CircleCategoryRepository extends JpaRepository<CircleCategory, Long> {
}