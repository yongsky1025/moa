package com.soldesk.moa.circle.controller;

import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.soldesk.moa.circle.dto.CircleCategoryResponseDTO;
import com.soldesk.moa.circle.dto.CircleCoverImageUrlRequestDTO;
import com.soldesk.moa.circle.dto.CircleCreateRequestDTO;
import com.soldesk.moa.circle.dto.CircleResponseDTO;
import com.soldesk.moa.circle.dto.CircleUpdateRequestDTO;
import com.soldesk.moa.circle.service.CircleService;
import com.soldesk.moa.common.dto.PageRequestDTO;
import com.soldesk.moa.common.dto.PageResultDTO;
import com.soldesk.moa.auth.dto.AuthUserDTO;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/circles")
@RequiredArgsConstructor
@Validated
public class CircleController {

    private final CircleService circleService;

    // 카테고리 전체 목록 조회
    @GetMapping("/categories")
    public ResponseEntity<List<CircleCategoryResponseDTO>> getCategories() {
        return ResponseEntity.ok(circleService.getCategories());
    }

    // 내가 가입한 서클 목록 조회
    @GetMapping("/me")
    public ResponseEntity<List<CircleResponseDTO>> getMyCircles(
            @AuthenticationPrincipal AuthUserDTO authUserDTO) {

        return ResponseEntity.ok(circleService.getMyCircles(authUserDTO.getUserId()));
    }

    // 서클 생성 (multipart/form-data, POST는 Tomcat이 multipart 정상 처리)
    // - data 파트: CircleCreateRequestDTO (JSON)
    // - image 파트: 대표 이미지 파일 (선택)
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CircleResponseDTO> createCircle(
            @RequestPart("data") @Valid CircleCreateRequestDTO request,
            @RequestPart(value = "image", required = false) MultipartFile image,
            @AuthenticationPrincipal AuthUserDTO authUserDTO) {

        return ResponseEntity.ok(circleService.createCircle(request, image, authUserDTO.getUserId()));
    }

    // 추천 서클 목록 조회
    @GetMapping("/recommended")
    public ResponseEntity<List<CircleResponseDTO>> getRecommendedCircles(
            @AuthenticationPrincipal AuthUserDTO authUserDTO) {
        return ResponseEntity.ok(circleService.getRecommendedCircles(authUserDTO.getUserId()));
    }

    // 서클 상세 조회
    @GetMapping("/{circleId}")
    public ResponseEntity<CircleResponseDTO> getCircle(
            @PathVariable Long circleId) {

        return ResponseEntity.ok(circleService.getCircle(circleId));
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
    public ResponseEntity<Void> deleteCircle(
            @PathVariable Long circleId,
            @AuthenticationPrincipal AuthUserDTO authUserDTO) {
        circleService.deleteCircle(circleId, authUserDTO.getUserId());
        return ResponseEntity.noContent().build();
    }

    // 서클 수정 (JSON, 기존 방식 유지)
    // - 이미지 변경은 POST /{circleId}/image-url 권장
    // - POST /{circleId}/image 는 하위호환용 legacy
    @PutMapping("/{circleId}")
    public ResponseEntity<CircleResponseDTO> updateCircle(
            @PathVariable Long circleId,
            @RequestBody @Valid CircleUpdateRequestDTO request,
            @AuthenticationPrincipal AuthUserDTO authUserDTO) {

        return ResponseEntity.ok(circleService.updateCircle(circleId, request, authUserDTO.getUserId()));
    }

    // 서클 대표 이미지 업로드/교체 legacy 경로 (하위호환 유지)
    // 신규 코드는 /{circleId}/image-url 사용 권장
    @Deprecated(since = "upload-url-introduced")
    @PostMapping(value = "/{circleId}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CircleResponseDTO> uploadCoverImage(
            @PathVariable Long circleId,
            @RequestPart("image") MultipartFile image,
            @AuthenticationPrincipal AuthUserDTO authUserDTO) {

        return ResponseEntity.ok(circleService.uploadCoverImage(circleId, image, authUserDTO.getUserId()));
    }

    // 서클 대표 이미지 URL 연결 (upload-url 계약 기반)
    @PostMapping("/{circleId}/image-url")
    public ResponseEntity<CircleResponseDTO> updateCoverImageByUrl(
            @PathVariable Long circleId,
            @RequestBody @Valid CircleCoverImageUrlRequestDTO request,
            @AuthenticationPrincipal AuthUserDTO authUserDTO) {

        return ResponseEntity.ok(
                circleService.updateCoverImageByUrl(circleId, request.getFileUrl(), authUserDTO.getUserId()));
    }

}
