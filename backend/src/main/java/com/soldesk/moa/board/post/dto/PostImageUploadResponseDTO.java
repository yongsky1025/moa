package com.soldesk.moa.board.post.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Deprecated(forRemoval = false)
public class PostImageUploadResponseDTO {
    private Long imageId;
    private String tempKey;
    private String imageUrl;
    private Long ord;
}
