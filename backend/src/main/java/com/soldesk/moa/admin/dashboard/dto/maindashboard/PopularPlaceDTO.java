package com.soldesk.moa.admin.dashboard.dto.maindashboard;

// 인기장소(최근30일기준)
public record PopularPlaceDTO(
                Long placeId,
                String name,
                String city,
                Double score,
                Double averageRating,
                long recentReservationCount,
                long recentLikeCount) {

}
