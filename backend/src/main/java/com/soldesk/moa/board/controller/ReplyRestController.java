package com.soldesk.moa.board.controller;

import java.util.List;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.soldesk.moa.board.dto.ReplyRequestDTO;
import com.soldesk.moa.board.dto.ReplyResponseDTO;
import com.soldesk.moa.board.service.ReplyService;
import com.soldesk.moa.users.dto.AuthUserDTO;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Controller
@RequestMapping("/api/posts/{postId}/replies")
@RestController
@RequiredArgsConstructor
public class ReplyRestController {

    private final ReplyService replyService;

    @GetMapping
    public List<ReplyResponseDTO> list(@PathVariable("postId") Long postId) {
        return replyService.list(postId);
    }

    @PostMapping
    public Long create(@PathVariable("postId") Long postId,
            @RequestBody @Valid ReplyRequestDTO req,
            @AuthenticationPrincipal AuthUserDTO auth) {
        return replyService.createReply(postId, auth.getUserId(), req);
    }

    @PostMapping("/{replyId}")
    public Long createChild(@PathVariable("postId") Long postId,
            @PathVariable("replyId") Long replyId,
            @RequestBody @Valid ReplyRequestDTO req,
            @AuthenticationPrincipal AuthUserDTO auth) {
        return replyService.createChildReply(postId, replyId, auth.getUserId(), req);
    }

    @PutMapping("/{replyId}")
    public Long update(@PathVariable("replyId") Long replyId,
            @RequestBody @Valid ReplyRequestDTO req,
            @AuthenticationPrincipal AuthUserDTO auth) {
        return replyService.update(replyId, auth.getUserId(), req);
    }

    @DeleteMapping("/{replyId}")
    public void delete(@PathVariable("replyId") Long replyId,
            @AuthenticationPrincipal AuthUserDTO auth) {
        replyService.delete(replyId, auth.getUserId());
    }
}
