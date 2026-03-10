package com.soldesk.moa.admin.dashboard.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface SearchPostRepository {

    Page<Object[]> searchBoardListByUserId(Long userId, Pageable pageable);
}
