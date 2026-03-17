package com.soldesk.moa.board.post.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@RequestMapping("/circle/{circleId}")
@RequiredArgsConstructor
@Controller
@Log4j2
public class CirclePageController {

    // 목록 페이지
    // GET /circle/{circleId}/boards/{boardId}/posts
    @GetMapping
    public String listPage(@PathVariable("circleId") Long circleId) {
        return "board/circle/list";
    }

    // 상세 페이지
    // GET /circles/{circleId}/boards/{boardId}/posts/{postId}
    @GetMapping("/board/{boardId}/posts/{postId}")
    public String readPage(@PathVariable("circleId") Long circleId,
            @PathVariable("boardId") Long boardId,
            @PathVariable("postId") Long postId) {
        return "board/circle/read";
    }

    // 글쓰기 페이지
    // GET /circles/{circleId}/boards/{boardId}/posts/new
    @GetMapping("/board/{boardId}/posts/new")
    public String createPage(@PathVariable("circleId") Long circleId,
            @PathVariable("boardId") Long boardId) {
        return "board/circle/create";
    }

    // 수정 페이지
    // GET /circles/{circleId}/boards/{boardId}/posts/{postId}/edit
    @GetMapping("/board/{boardId}/posts/{postId}/edit")
    public String editPage(@PathVariable("circleId") Long circleId,
            @PathVariable("boardId") Long boardId,
            @PathVariable("postId") Long postId) {
        return "board/circle/edit";
    }
}
