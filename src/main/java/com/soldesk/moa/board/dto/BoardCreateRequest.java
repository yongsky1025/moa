package com.soldesk.moa.board.dto;

import com.soldesk.moa.board.entity.constant.BoardType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BoardCreateRequest {

    @NotBlank
    private String title;

    @NotBlank
    private String content;

    // 로그인 연동 전 임시 :작성자 userId를 요청으로 받음
    // 이후 로그인 정보를 기반으로 담을 예정
    private Long userId;

    private BoardType boardType;

}
