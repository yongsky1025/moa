package com.soldesk.moa.place.dto;

import java.util.List;

public record PlaceListResponseDTO(
        List<PlaceResponseDTO> places,
        boolean hasNext,
        Long lastId
) {}
