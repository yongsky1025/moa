package com.soldesk.moa.admin.report.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.soldesk.moa.admin.report.entity.Sanction;

public interface SanctionRepository extends JpaRepository<Sanction, Long> {

}
