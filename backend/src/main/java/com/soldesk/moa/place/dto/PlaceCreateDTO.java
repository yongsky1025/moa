package com.soldesk.moa.place.dto;

import java.util.List;

import lombok.Builder;

@Builder
public record PlaceCreateDTO( // 지도 api 추가 후 위경도는 자동으로 안받아도 자동으로 입력되게 할 예정
        String name,
        String address,
        String city,
        String district,
        double latitude,
        double longitude,
        int capacity,
        int pricePerHour,
        String description,
        int openTimeHour,
        int openTimeMinute,
        int closeTimeHour,
        int closeTimeMinute,
        int minReservationMinutes,
        int maxReservationMinutes,
        List<Long> tagIds,
        List<PlaceClosedDayDTO> placeClosedDays,
        List<String> imagePaths // 이미지
) {

}
