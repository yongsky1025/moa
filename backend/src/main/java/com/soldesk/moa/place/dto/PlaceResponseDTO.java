package com.soldesk.moa.place.dto;

import lombok.Builder;

@Builder
public record PlaceResponseDTO(
                long id,
                String name,
                String address,
                String city,
                String district,
                String dong,
                double latitude,
                double longitude,
                int capacity,
                int pricePerHour,
                double avgRating,
                int reviewCount,
                String representativeImagePath) {

}
