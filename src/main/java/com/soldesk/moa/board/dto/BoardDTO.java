package com.soldesk.moa.board.dto;

import java.time.LocalDateTime;

import com.soldesk.moa.board.entity.constant.BoardType;
import com.soldesk.moa.users.entity.Users;

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

    private Long bno;

    private BoardType boardType;

    private String title;

    private String content;

    private String writer; // Users.nickname

    private int viewCount;

    private int replyCnt;

    private LocalDateTime createDate;

}
