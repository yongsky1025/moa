package com.soldesk.moa.place.dto;

import java.util.List;

public record PlaceRecommendResponseDTO(
    Long id,
    String name,
    String address,
    String city,
    String district,
    Double latitude,
    Double longitude,
    Integer capacity,
    Integer pricePerHour,
    List<String> tags,
    Double similarity,    // 임베딩 코사인 유사도 (0~1)
    Double distanceKm,    // 거리 (위치 미제공 시 null)
    Double score          // 최종 복합 점수 (임베딩 70% + 거리 30%)
) {}
