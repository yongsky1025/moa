package com.soldesk.moa.board.dto;

import java.time.LocalDateTime;

import com.soldesk.moa.board.entity.constant.BoardType;
import com.soldesk.moa.circle.entity.Circle;

import groovyjarjarantlr4.v4.runtime.misc.NotNull;
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
public class BoardRequestDTO {

    // 만들 때는 boardType이 필요 (NOTICE/FREE/SUPPORT/CIRCLE)
    @NotNull
    private BoardType boardType;

    @NotBlank
    private String name;

    // CIRCLE board 생성할 때만 필요 (global이면 null)
    private Long circleId;

    // getter/setter
}
