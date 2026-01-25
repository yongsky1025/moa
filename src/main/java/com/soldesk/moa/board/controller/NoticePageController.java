package com.soldesk.moa.board.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@RequestMapping("/notice")
@RequiredArgsConstructor
@Controller
@Log4j2
public class NoticePageController {

    @GetMapping("")
    public String listPage() {
        log.info("공지사항 리스트 호출");
        return "notice/list";
    }

    @GetMapping("/{postId}")
    public String readPage(@PathVariable("postId") Long postId) {
        log.info("공지사항 상세 호출{}", postId);
        return "notice/read";
    }

    @GetMapping("/new")
    public String createPage() {
        log.info("공지사항 생성 호출");
        return "notice/create";
    }

    @GetMapping("/{postId}/edit")
    public String editPage(@PathVariable("postId") Long postId) {
        log.info("공지사항 수정 호출{}", postId);
        return "notice/edit";
    }

}
