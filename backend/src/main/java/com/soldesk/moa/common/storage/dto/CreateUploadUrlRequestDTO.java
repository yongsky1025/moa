package com.soldesk.moa.common.storage.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateUploadUrlRequestDTO {

    private String domain;

    @NotBlank(message = "fileName은 필수입니다.")
    private String fileName;

    @NotBlank(message = "contentType은 필수입니다.")
    private String contentType;
}
