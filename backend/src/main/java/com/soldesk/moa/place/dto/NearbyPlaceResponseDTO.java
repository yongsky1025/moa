package com.soldesk.moa.place.dto;

public record NearbyPlaceResponseDTO(
    Long id,
    String name,
    String address,
    String city,
    String district,
    Double latitude,
    Double longitude,
    Integer capacity,
    Integer pricePerHour,
    Double distanceKm
) {}
