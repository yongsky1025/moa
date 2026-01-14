package com.soldesk.moa.circle.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.soldesk.moa.circle.dto.CircleCreateRequest;
import com.soldesk.moa.circle.dto.CircleResponse;
import com.soldesk.moa.circle.dto.CircleUpdateRequest;
import com.soldesk.moa.circle.entity.Circle;
import com.soldesk.moa.circle.entity.CircleCategory;
import com.soldesk.moa.circle.entity.constant.CircleStatus;
import com.soldesk.moa.circle.repository.CircleCategoryRepository;
import com.soldesk.moa.circle.repository.CircleRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class CircleService {

    private final CircleRepository circleRepository;
    private final CircleCategoryRepository categoryRepository;

    // 서클 생성
    @Transactional
    public CircleResponse createCircle(CircleCreateRequest request) {

        CircleCategory circleCategory = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("카테고리가 존재하지 않습니다."));

        Circle circle = Circle.builder()
                .name(request.getName())
                .description(request.getDescription())
                .maxMember(request.getMaxMember())
                .currentMember(1) // 생성자 = 모임장
                .status(CircleStatus.OPEN) // 기본 OPEN
                .category(circleCategory)
                .build();

        return new CircleResponse(circleRepository.save(circle));
    }

    @Transactional(readOnly = true)
    public List<CircleResponse> getCircles() {
        return circleRepository.findAll()
                .stream()
                .map(CircleResponse::new)
                .toList();
    }

    @Transactional
    public void deleteCircle(Long circleId) {
        Circle circle = circleRepository.findById(circleId)
                .orElseThrow(() -> new IllegalArgumentException("서클이 존재하지 않습니다."));

        circleRepository.delete(circle);
    }

    @Transactional
    public CircleResponse updateCircle(Long circleId, CircleUpdateRequest request) {

        Circle circle = circleRepository.findById(circleId)
                .orElseThrow(() -> new IllegalArgumentException("서클이 존재하지 않습니다."));

        Circle updatedCircle = Circle.builder()
                .circleId(circle.getCircleId())
                .name(request.getName())
                .description(request.getDescription())
                .maxMember(circle.getMaxMember())
                .currentMember(circle.getCurrentMember())
                .status(circle.getStatus())
                .category(circle.getCategory())
                .build();

        return new CircleResponse(circleRepository.save(updatedCircle));
    }
}