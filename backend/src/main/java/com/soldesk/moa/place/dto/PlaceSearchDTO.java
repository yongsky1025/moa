package com.soldesk.moa.place.dto;

import java.util.List;

public record PlaceSearchDTO(
        String keyword,           // 키워드 (name, address, description, dong 전체 검색)
        String sort,              // newest, price_asc, price_desc, rating, reviews, capacity
        String city,              // 지역 필터 (예: 서울특별시)
        List<String> districts,   // 구/시 필터 다중 선택 (예: ["강남구", "마포구"])
        String dong,              // 동 필터 (예: 역삼동)
        Integer minPrice,         // 시간당 가격 최소
        Integer maxPrice,         // 시간당 가격 최대
        Integer minCapacity,      // 수용인원 최소
        Integer maxCapacity,      // 수용인원 최대
        List<Long> tagIds,        // 태그 ID 목록 (OR 조건)
        String availableDate,     // 예약가능날짜 (yyyy-MM-dd)
        Long lastId,              // 무한스크롤 커서 (마지막으로 받은 Place ID)
        int size                  // 한 번에 조회할 개수
) {
    public PlaceSearchDTO {
        if (size <= 0) size = 20;
    }
}
