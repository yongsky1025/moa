package com.soldesk.moa.board.dto;

import com.soldesk.moa.board.entity.constant.BoardType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class BoardRequestDTO {

    // GLOBAL(= NOTICE/FREE 계열), CIRCLE 구분값
    @NotNull
    private BoardType boardType;

    @NotBlank
    private String name;

    // CIRCLE board 생성할 때만 필요 (global이면 null)
    private Long circleId;

    // getter/setter
}
