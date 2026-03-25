package com.soldesk.moa.admin.dashboard.dto.placeInfo;

import com.soldesk.moa.common.dto.PageRequestDTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class AdminPlaceSearchDTO extends PageRequestDTO {

    private String sort;     // newest, name, capacity, price, rating, reviews
    private String city;     // 지역 필터
    private String district; // 구/시 필터
    private String status;   // ACTIVE, INACTIVE, MAINTENANCE
    private Integer minPrice;
    private Integer maxPrice;
    private Integer minCapacity;
    private Integer maxCapacity;
}
