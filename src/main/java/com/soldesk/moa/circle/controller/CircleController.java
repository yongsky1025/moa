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
import com.soldesk.moa.common.dto.PageRequestDTO;
import com.soldesk.moa.common.dto.PageResultDTO;
import com.soldesk.moa.users.entity.Users;
import com.soldesk.moa.users.entity.constant.CustomUserDetails;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/circles")
@RequiredArgsConstructor
@Validated
public class CircleController {

    private final CircleService circleService;
    private final CircleMemberService circleMemberService;

    // 서클 생성
    @PostMapping
    public ResponseEntity<CircleResponseDTO> createCircle(
            @RequestBody @Valid CircleCreateRequestDTO request,
            @AuthenticationPrincipal CustomUserDetails customUserDetails) {

        Users loginUser = customUserDetails.getUser();

        return ResponseEntity.ok(circleService.createCircle(request, loginUser));
    }

    // 서클 목록 조회
    @GetMapping
    public ResponseEntity<PageResultDTO<CircleResponseDTO>> getCircles(
            @RequestParam(value = "categoryId", required = false) Long categoryId,
            @ModelAttribute PageRequestDTO pageRequestDTO) {
        return ResponseEntity.ok(
                circleService.getCircles(categoryId, pageRequestDTO));
    }

    // 서클 삭제
    @DeleteMapping("/{circleId}")
    public ResponseEntity<Void> deleteCircle(@PathVariable Long circleId) {
        circleService.deleteCircle(circleId);
        return ResponseEntity.noContent().build();
    }

    // 서클 수정 (이름, 설명만)
    @PutMapping("/{circleId}")
    public ResponseEntity<CircleResponseDTO> updateCircle(
            @PathVariable Long circleId,
            @RequestBody @Valid CircleUpdateRequestDTO request) {

        return ResponseEntity.ok(circleService.updateCircle(circleId, request));
    }

}