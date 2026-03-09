package com.soldesk.moa.circle.repository;

import com.soldesk.moa.circle.entity.Circle;
import com.soldesk.moa.common.dto.PageRequestDTO;
import com.soldesk.moa.common.dto.PageResultDTO;

public interface CircleRepositoryCustom {

    PageResultDTO<Circle> findByCategory_CategoryId(
            Long categoryId,
            PageRequestDTO pageRequestDTO);
}