package com.soldesk.moa.board.controller;

import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.soldesk.moa.board.dto.BoardCreateRequest;
import com.soldesk.moa.board.dto.PostDTO;
import com.soldesk.moa.board.dto.BoardUpdateRequest;
import com.soldesk.moa.board.entity.Post;
import com.soldesk.moa.board.service.BoardService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/board")
public class BoardRestController {

    private final BoardService boardService;

    // // 전체 목록 조회
    // // GET /api/board
    // @GetMapping("/list")
    // public List<PostDTO> getList() {
    // return boardService.getList();
    // }

    // // // 상세 페이지
    // // // GET /api/board/{bno}
    // // @GetMapping("/read/{bno}")
    // // public PostDTO getRead(@PathVariable("bno") Long bno) {
    // // return boardService.getRead(bno);
    // // }

    // // POST /api/board/create (생성)
    // @PostMapping("/create")
    // public ResponseEntity<Void> create(@RequestBody @Valid BoardCreateRequest
    // req) {
    // Long bno = boardService.create(req);
    // return ResponseEntity.created(URI.create("/api/board/" + bno)).build();
    // }

<<<<<<< HEAD
    // // PUT /api/board/modify/{bno} (수정)
    // @PutMapping("/modify/{bno}")
    // public ResponseEntity<Void> modify(@PathVariable Long bno,
    // @RequestBody @Valid BoardUpdateRequest req) {
    // boardService.modify(bno, req);
    // return ResponseEntity.noContent().build();
    // }
=======
    // PUT /api/board/modify/{bno} (수정)
    @PutMapping("/modify/{bno}")
    public ResponseEntity<Void> modify(@PathVariable Long bno,
            @RequestBody @Valid BoardUpdateRequest req) {
        boardService.modify(bno, req);
        return ResponseEntity.noContent().build();
    }
>>>>>>> 003e61bc8ba3f0867e883e15fff91f95ef115c2d

    // // DELETE /api/board/delete/{bno} (삭제)
    // @DeleteMapping("/delete/{bno}")
    // public ResponseEntity<Void> delete(@PathVariable Long bno) {
    // boardService.delete(bno);
    // return ResponseEntity.noContent().build();
    // }
}
