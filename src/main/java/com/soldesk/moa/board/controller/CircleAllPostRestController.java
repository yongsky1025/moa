package com.soldesk.moa.board.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.soldesk.moa.board.dto.PostResponseDTO;
import com.soldesk.moa.board.service.PostService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Log4j2
@RequestMapping("/api")
@RestController
@RequiredArgsConstructor
public class CircleAllPostRestController {

    private final PostService postService;

    // 써클 전체 게시물
    @GetMapping("/circles/{circleId}/posts")
    public List<PostResponseDTO> listAllBoards(@PathVariable("circleId") Long circleId) {
        return postService.listCircleAllBoardsPosts(circleId);
    }
}