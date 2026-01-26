package com.soldesk.moa.board.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@RequestMapping("/free")
@RequiredArgsConstructor
@Controller
@Log4j2
public class FreePageController {

    @GetMapping("")
    public String listPage() {
        log.info("자유 리스트 호출");
        return "board/free/list";
    }

    @GetMapping("/{postId}")
    public String readPage(@PathVariable("postId") Long postId) {
        log.info("자유 상세 호출{}", postId);
        return "board/free/read";
    }

    @GetMapping("/new")
    public String createPage() {
        log.info("자유 생성 호출");
        return "board/free/create";
    }

    @GetMapping("/{postId}/edit")
    public String editPage(@PathVariable("postId") Long postId) {
        log.info("자유 수정 호출{}", postId);
        return "board/free/edit";
    }

}
