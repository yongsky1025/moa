package com.soldesk.moa.place.dto;

import java.util.List;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PlaceReviewUpdateDTO(
        @Min(1) @Max(5) int rating,
        @NotBlank String comment,
        @Size(max = 3) List<String> imagePaths) {
}
