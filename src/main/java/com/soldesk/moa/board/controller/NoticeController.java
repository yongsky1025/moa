// package com.soldesk.moa.board.controller;

// import org.springframework.stereotype.Controller;
// import org.springframework.web.bind.annotation.RequestMapping;
// import org.springframework.web.bind.annotation.RequestParam;

// import lombok.RequiredArgsConstructor;
// import lombok.extern.log4j.Log4j2;
// import org.springframework.web.bind.annotation.GetMapping;
// import org.springframework.web.bind.annotation.PathVariable;

// @RequestMapping("/board/notice")
// @RequiredArgsConstructor
// @Controller
// @Log4j2
// public class NoticeController {

// @GetMapping("")
// public String noticeList(@RequestParam("boardId") Long boardId) {
// log.info("notice list boardId={}", boardId);
// return "board/notice/list";
// }

// @GetMapping("/read/{postId}")
// public String getPost(@PathVariable Long postId) {
// log.info("post상세 호출{}", postId);
// return "board/read";
// }

// @GetMapping("/modify/{bno}")
// public String update(@PathVariable Long bno) {
// log.info("board modify 호출{}", bno);
// return "board/modify";
// }

// @GetMapping("/create")
// public String create() {
// log.info("board create 호출");
// return "board/create";
// }
// }
