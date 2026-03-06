package com.soldesk.moa.board.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@RequestMapping("/circles/{circleId}/boards")
@RequiredArgsConstructor
@Controller
@Log4j2
public class CircleBoardPageController {

    // 써클 게시판 목록/관리 화면
    @GetMapping
    public String boardListPage(@PathVariable("circleId") Long circleId) {
        return "board/circle/boards";
    }

    // 게시판 생성 화면
    @GetMapping("/new")
    public String boardCreatePage(@PathVariable("circleId") Long circleId) {
        return "board/circle/board-create";
    }

    // 게시판 이름 수정 화면
    @GetMapping("/{boardId}/edit")
    public String boardEditPage(@PathVariable("circleId") Long circleId,
            @PathVariable("boardId") Long boardId) {
        return "board/circle/board-edit";
    }
}