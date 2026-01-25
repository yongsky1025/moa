package com.soldesk.moa.board.dto;

import java.time.LocalDateTime;

import com.soldesk.moa.board.entity.constant.BoardRole;
import com.soldesk.moa.circle.entity.Circle;

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
public class BoardDTO {

    private Long boardId;

    private BoardRole boardRole; // GLOBAL,CIRCLE

    private String name;

    private Long circleId;

    private LocalDateTime createDate;

    private LocalDateTime updateDate;
}
