package com.soldesk.moa.circle.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.soldesk.moa.auth.dto.AuthUserDTO;
import com.soldesk.moa.circle.dto.CircleLikeResponseDTO;
import com.soldesk.moa.circle.service.CircleLikeService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/circles/{circleId}/like")
@RequiredArgsConstructor
public class CircleLikeController {

    private final CircleLikeService circleLikeService;

    // 좋아요 토글 (로그인 필요)
    @PostMapping
    public ResponseEntity<CircleLikeResponseDTO> toggle(
            @PathVariable Long circleId,
            @AuthenticationPrincipal AuthUserDTO authUser) {

        return ResponseEntity.ok(circleLikeService.toggle(authUser.getUserId(), circleId));
    }

    // 현재 좋아요 상태 조회 (로그인 필요)
    @GetMapping
    public ResponseEntity<CircleLikeResponseDTO> getStatus(
            @PathVariable Long circleId,
            @AuthenticationPrincipal AuthUserDTO authUser) {

        return ResponseEntity.ok(circleLikeService.getStatus(authUser.getUserId(), circleId));
    }
}
