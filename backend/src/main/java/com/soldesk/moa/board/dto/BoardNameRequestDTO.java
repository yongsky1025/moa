package com.soldesk.moa.board.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BoardNameRequestDTO {

    @NotBlank
    private String name;
}

