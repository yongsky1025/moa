package com.soldesk.moa.common.storage.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateUploadUrlResponseDTO {

    private String uploadUrl;
    private String fileUrl;
    private String key;
    private String thumbnailUrl;
    private String thumbnailKey;
    private String method;
}
