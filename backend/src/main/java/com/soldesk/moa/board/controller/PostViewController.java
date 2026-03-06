package com.soldesk.moa.board.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import com.soldesk.moa.board.service.PostService;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostViewController {
    private final PostService postService;

    @PostMapping("/{postId}/view")
    public ResponseEntity<Void> increase(@PathVariable("postId") Long postId, HttpSession session) {
        postService.increaseViewCountOnce(postId, session);
        return ResponseEntity.noContent().build();
    }

}