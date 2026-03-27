package com.soldesk.moa.admin.dashboard.dto.statistic;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminPlaceStatisticDTO {
    // 장소관련 통계는 여기서 한번에 보내겠음
    private List<CategoryUsageDTO> categoryUsageDTOs;
    private List<CityDistDTO> cityDistDTOs;
    private PlaceConversionRateDTO placeConversionRateDTO;
}
