package com.soldesk.moa.admin.dashboard.dto.postInfo;

import java.time.LocalDate;

import com.soldesk.moa.board.entity.constant.BoardType;
import com.soldesk.moa.common.dto.PageRequestDTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class AdminPostSearchDTO extends PageRequestDTO {
    private BoardType boardType;    // NOTICE, FREE, SUPPORT, CIRCLE
    private Boolean deleted;        // null=전체, true=삭제됨, false=정상
    private LocalDate startDate;    // 작성일 시작
    private LocalDate endDate;      // 작성일 끝
    private Long circleId;          // CIRCLE 타입일 때 2차 필터
    private String sort;            // newest, views, replies (기본: newest)
}
