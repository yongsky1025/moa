package com.soldesk.moa.circle.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.soldesk.moa.circle.dto.CircleCreateRequestDTO;
import com.soldesk.moa.circle.dto.CircleResponseDTO;
import com.soldesk.moa.circle.dto.CircleUpdateRequestDTO;
import com.soldesk.moa.circle.service.CircleService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/circles")
@RequiredArgsConstructor
@Validated
public class CircleController {

    private final CircleService circleService;

    // 서클 생성
    @PostMapping
    public ResponseEntity<CircleResponseDTO> createCircle(
            @RequestBody @Valid CircleCreateRequestDTO request) {

        return ResponseEntity.ok(circleService.createCircle(request));
    }

    // 서클 목록 조회
    @GetMapping
    public ResponseEntity<List<CircleResponseDTO>> getCircles() {
        return ResponseEntity.ok(circleService.getCircles());
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<CircleResponseDTO>> getCirclesByCategory(
            @PathVariable Long categoryId) {

        return ResponseEntity.ok(circleService.getCirclesByCategory(categoryId));
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