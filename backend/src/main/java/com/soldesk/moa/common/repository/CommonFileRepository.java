package com.soldesk.moa.common.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.soldesk.moa.common.entity.CommonFile;

public interface CommonFileRepository extends JpaRepository<CommonFile, Long> {
}
