package com.soldesk.moa.board.post.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PostImageTempBindRequestDTO {
    private String tempKey;
    private Long thumbnailImageId;
}
