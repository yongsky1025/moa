package com.soldesk.moa.circle.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class CircleCreateRequest {

    @NotNull(message = "카테고리는 필수입니다.")
    private Long categoryId;

    @NotBlank(message = "서클 이름은 필수입니다.")
    @Size(max = 20, message = "서클 이름은 20자 이내여야 합니다.")
    private String name;

    @Size(max = 255, message = "설명은 255자 이내여야 합니다.")
    private String description;

    @Min(value = 10, message = "최대 인원은 최소 10명 이상이어야 합니다.")
    private int maxMember;
}