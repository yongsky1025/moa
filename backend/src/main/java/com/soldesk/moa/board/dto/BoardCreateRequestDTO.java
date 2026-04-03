package com.soldesk.moa.board.dto;

import com.soldesk.moa.board.entity.constant.CircleBoardKind;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BoardCreateRequestDTO {

    @NotNull
    private BoardScope scope;

    @NotBlank
    private String name;

    private Long circleId;

    private CircleBoardKind circleBoardKind;
}
