package com.soldesk.moa.admin.report.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.soldesk.moa.admin.report.dto.SanctionFilterDTO;
import com.soldesk.moa.admin.report.entity.Sanction;

public interface SearchSanctionRepository {

    // 제재 리스트
    Page<Sanction> searchSanctions(SanctionFilterDTO filterDTO, Pageable pageable);
}
