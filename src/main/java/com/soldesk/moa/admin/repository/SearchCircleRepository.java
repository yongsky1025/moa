package com.soldesk.moa.admin.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface SearchCircleRepository {
    Page<Object[]> getJoinCircleByUserId(Long userId, Pageable pageable);

}
