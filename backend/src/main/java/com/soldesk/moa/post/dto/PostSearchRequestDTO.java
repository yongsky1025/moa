package com.soldesk.moa.post.dto;

import com.soldesk.moa.board.entity.constant.BoardType;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PostSearchRequestDTO {

    private String q;
    private Integer page = 1;
    private Integer size = 20;
    private PostSearchTarget target = PostSearchTarget.ALL;
    private BoardType boardType;
    private Long circleId;
}

