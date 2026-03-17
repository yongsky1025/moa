package com.soldesk.moa.image.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImageTempUploadResponseDTO {
    private Long imageId;
    private String tempKey;
    private String imageUrl;
    private Long ord;
}
