package com.soldesk.moa.board.post.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Builder
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class PostRequestDTO {

    @NotBlank
    private String title;

    @NotBlank
    private String content;

    private String tempKey;

    private Long thumbnailImageId;
}
