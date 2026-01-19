package com.soldesk.moa.circle.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.soldesk.moa.circle.dto.CircleCreateRequestDTO;
import com.soldesk.moa.circle.dto.CircleMemberResponseDTO;
import com.soldesk.moa.circle.dto.CircleMemberStatusRequestDTO;
import com.soldesk.moa.circle.dto.CircleResponseDTO;
import com.soldesk.moa.circle.dto.CircleUpdateRequestDTO;
import com.soldesk.moa.circle.service.CircleMemberService;
import com.soldesk.moa.circle.service.CircleService;
import com.soldesk.moa.users.entity.Users;
import com.soldesk.moa.users.entity.constant.CustomUserDetails;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/circles")
@RequiredArgsConstructor
@Validated
public class CIircleMemberContoller {

    private final CircleService circleService;
    private final CircleMemberService circleMemberService;

    // 가입 신청 목록 조회 (리더만)
    @GetMapping("/{circleId}/members/pending")
    public ResponseEntity<List<CircleMemberResponseDTO>> getPendingMembers(
            @PathVariable Long circleId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(
                circleMemberService.getPendingMembers(circleId, userDetails.getUser()));
    }

    // 멤버 상태 변경 (승인/거절)
    @PatchMapping("/members/{memberId}")
    public ResponseEntity<Void> updateMemberStatus(
            @PathVariable Long memberId,
            @RequestBody CircleMemberStatusRequestDTO request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        circleMemberService.changeStatus(
                memberId,
                request.getStatus(),
                userDetails.getUser());

        return ResponseEntity.ok().build();
    }

}
