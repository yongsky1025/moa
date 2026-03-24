package com.soldesk.moa.circle.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class CircleCoverImageUrlRequestDTO {

    @NotBlank(message = "fileUrl은 필수입니다.")
    private String fileUrl;
}
