package com.soldesk.moa.board.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@RequestMapping("/board")
@RequiredArgsConstructor
@Controller
@Log4j2
public class BoardController {

    @GetMapping("/list")
    public void getList() {
        log.info("board list 호출");

    }

    @GetMapping("/read/{bno}")
    public String read(@PathVariable Long bno) {
        log.info("board read 호출{}", bno);
        return "board/read";
    }

    @GetMapping("/modify/{bno}")
    public String modify(@PathVariable Long bno) {
        log.info("board modify 호출{}", bno);
        return "board/modify";
    }

    @GetMapping("/create")
    public String create() {
        log.info("board create 호출");
        return "board/create";
    }

}
