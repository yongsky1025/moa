package com.soldesk.moa.board.dto;

import java.time.LocalDateTime;

import com.soldesk.moa.board.entity.Board;
import com.soldesk.moa.board.entity.constant.BoardRole;
import com.soldesk.moa.users.entity.Users;

import jakarta.persistence.Column;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
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
public class PostDTO {

    private Long postId;

    private String title;

    private String content;

    private String writer; // users.nickname

    private int viewCount;

    private int replyCnt;

    private LocalDateTime createDate;

}
