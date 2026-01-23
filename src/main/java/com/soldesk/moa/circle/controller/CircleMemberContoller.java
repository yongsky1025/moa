package com.soldesk.moa.circle.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.soldesk.moa.circle.dto.CircleMemberResponseDTO;
import com.soldesk.moa.circle.dto.CircleMemberStatusRequestDTO;
import com.soldesk.moa.circle.service.CircleMemberService;
import com.soldesk.moa.users.entity.constant.CustomUserDetails;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/circles/{circleId}/members")
@RequiredArgsConstructor
@Validated
public class CircleMemberContoller {

    private final CircleMemberService circleMemberService;

    // 가입 신청
    @PostMapping
    public ResponseEntity<Void> joinCircle(
            @PathVariable Long circleId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        circleMemberService.requestJoin(circleId, userDetails.getUser());

        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    // 가입 신청 목록 조회 (리더만)
    @GetMapping("/pending")
    public ResponseEntity<List<CircleMemberResponseDTO>> getPendingMembers(
            @PathVariable Long circleId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(
                circleMemberService.getPendingMembers(circleId, userDetails.getUser()));
    }

    // 멤버 상태 변경 (승인 / 거절)
    @PatchMapping("/{memberId}")
    public ResponseEntity<Void> updateMemberStatus(
            @PathVariable Long circleId,
            @PathVariable Long memberId,
            @RequestBody CircleMemberStatusRequestDTO request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        circleMemberService.changeStatus(
                circleId,
                memberId,
                request.getStatus(),
                userDetails.getUser());

        return ResponseEntity.ok().build();
    }
}
