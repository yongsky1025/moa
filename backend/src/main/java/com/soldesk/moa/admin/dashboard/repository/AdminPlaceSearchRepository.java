package com.soldesk.moa.admin.dashboard.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.soldesk.moa.admin.dashboard.dto.maindashboard.PopularPlaceDTO;
import com.soldesk.moa.admin.dashboard.dto.maindashboard.ReservationCountDTO;
import com.soldesk.moa.admin.dashboard.dto.placeInfo.AdminPlaceSearchDTO;
import com.soldesk.moa.admin.dashboard.dto.statistic.CategoryUsageDTO;
import com.soldesk.moa.admin.dashboard.dto.statistic.CityDistDTO;
import com.soldesk.moa.admin.dashboard.dto.statistic.DistrictDistDTO;
import com.soldesk.moa.admin.dashboard.dto.statistic.PlaceConversionRateDTO;
import com.soldesk.moa.place.entity.Place;

public interface AdminPlaceSearchRepository {

    Page<Place> searchAdminPlaces(AdminPlaceSearchDTO searchDTO, Pageable pageable);

    // 장소 대시보드, 통계관련
    // 장소 예약률
    ReservationCountDTO getReservationCounts();

    // 인기장소top5 (최근한달)
    List<PopularPlaceDTO> findTop5PopularPlaces(LocalDateTime since);

    // 장소 이용률(장소의 총시간대비 실제예약시간)
    Double calculateUtilizationRate(LocalDateTime since);

    // 일정-장소 연계율
    PlaceConversionRateDTO calculateConversionRate();

    // 지역 분포(시/도)
    List<CityDistDTO> getCityDistribution();

    // 지역분포(구/군)
    List<DistrictDistDTO> getDistrictDistribution(String city);

    // 모임카테고리x장소이용
    List<CategoryUsageDTO> getCategoryUsageStats();
}
