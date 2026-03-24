package com.soldesk.moa.reply.controller;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.soldesk.moa.reply.dto.ReplyRequestDTO;
import com.soldesk.moa.reply.dto.ReplyResponseDTO;
import com.soldesk.moa.reply.service.ReplyService;
import com.soldesk.moa.auth.dto.AuthUserDTO;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RequestMapping("/api/posts/{postId}/replies")
@RestController
@RequiredArgsConstructor
public class ReplyRestController {

    private final ReplyService replyService;

    @GetMapping
    public List<ReplyResponseDTO> list(@PathVariable("postId") Long postId,
            @AuthenticationPrincipal AuthUserDTO auth) {
        Long userId = auth == null ? null : auth.getUserId();
        return replyService.list(postId, userId);
    }

    @PreAuthorize("isAuthenticated()")
    @PostMapping
    public Long create(@PathVariable("postId") Long postId,
            @RequestBody @Valid ReplyRequestDTO req,
            @AuthenticationPrincipal AuthUserDTO auth) {
        return replyService.createReply(postId, auth.getUserId(), req);
    }

    @PreAuthorize("isAuthenticated()")
    @PostMapping("/{replyId}")
    public Long createChild(@PathVariable("postId") Long postId,
            @PathVariable("replyId") Long replyId,
            @RequestBody @Valid ReplyRequestDTO req,
            @AuthenticationPrincipal AuthUserDTO auth) {
        return replyService.createChildReply(postId, replyId, auth.getUserId(), req);
    }

    @PreAuthorize("isAuthenticated()")
    @PutMapping("/{replyId}")
    public Long update(@PathVariable("replyId") Long replyId,
            @RequestBody @Valid ReplyRequestDTO req,
            @AuthenticationPrincipal AuthUserDTO auth) {
        return replyService.update(replyId, auth.getUserId(), req);
    }

    @PreAuthorize("isAuthenticated()")
    @DeleteMapping("/{replyId}")
    public void delete(@PathVariable("replyId") Long replyId,
            @AuthenticationPrincipal AuthUserDTO auth) {
        replyService.delete(replyId, auth.getUserId());
    }
}
