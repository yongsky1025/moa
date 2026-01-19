package com.soldesk.moa.board.controller;

import java.util.List;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.soldesk.moa.board.dto.BoardDTO;
import com.soldesk.moa.board.entity.Board;
import com.soldesk.moa.board.entity.constant.BoardType;
import com.soldesk.moa.board.service.BoardService;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RequestMapping("/board/notice")
@RequiredArgsConstructor
@Controller
@Log4j2
public class NoticeController {

    private final BoardService boardService;

    @GetMapping("/list")
    public String getList(Model model) {
        log.info("Notice list");
        List<BoardDTO> dto = boardService.getBoardsByType(BoardType.NOTICE);
        model.addAttribute("dto", dto);
        return "board/notice/list";
    }

    @GetMapping({ "/read", "/modify" })
    public void getRead(@RequestParam("bno") Long bno, Model model) {
        log.info("read or modify{}", bno);

        BoardDTO dto = boardService.getNoticeRead(bno);
        model.addAttribute("dto", dto);

    }

}
