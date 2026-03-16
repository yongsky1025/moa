package com.soldesk.moa.circle.repository;

import java.util.List;

import com.soldesk.moa.circle.entity.Circle;
import com.soldesk.moa.common.dto.PageRequestDTO;
import com.soldesk.moa.common.dto.PageResultDTO;

public interface CircleRepositoryCustom {

    PageResultDTO<Circle> findByCategory_CategoryId(
            Long categoryId,
            PageRequestDTO pageRequestDTO);

    List<Circle> findRecommended(
            int socialLoad,
            int interactionMode,
            int structureLevel,
            int activityIntensity,
            int commitmentLevel);
}