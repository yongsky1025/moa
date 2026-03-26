package com.soldesk.moa.place.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
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

import com.soldesk.moa.auth.dto.AuthUserDTO;
import com.soldesk.moa.place.dto.MyPlaceReviewDTO;
import com.soldesk.moa.place.dto.PendingReviewDTO;
import com.soldesk.moa.place.dto.PlaceReviewCreateDTO;
import com.soldesk.moa.place.dto.PlaceReviewDetailDTO;
import com.soldesk.moa.place.dto.PlaceReviewUpdateDTO;
import com.soldesk.moa.place.service.PlaceReviewService;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@RestController
@RequestMapping("/api/place-reviews")
@RequiredArgsConstructor
@Tag(name = "Place Review section", description = "Response MOA API")
@Log4j2
public class PlaceReviewController {

    private final PlaceReviewService placeReviewService;

    // 장소 후기 목록 (상세 페이지용)
    @GetMapping("/places/{placeId}")
    public ResponseEntity<List<PlaceReviewDetailDTO>> getPlaceReviews(@PathVariable Long placeId) {
        return ResponseEntity.ok(placeReviewService.getPlaceReviews(placeId));
    }

    // 후기 작성
    @PostMapping("/{reservationId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Long> createReview(
            @PathVariable Long reservationId,
            @RequestBody @Valid PlaceReviewCreateDTO dto,
            @AuthenticationPrincipal AuthUserDTO authUserDTO) {
        log.info("후기 작성 reservationId={}, userId={}", reservationId, authUserDTO.getUserId());
        return ResponseEntity.ok(placeReviewService.createReview(reservationId, authUserDTO.getUserId(), dto));
    }

    // 후기 수정
    @PutMapping("/{reviewId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> updateReview(
            @PathVariable Long reviewId,
            @RequestBody @Valid PlaceReviewUpdateDTO dto,
            @AuthenticationPrincipal AuthUserDTO authUserDTO) {
        placeReviewService.updateReview(reviewId, authUserDTO.getUserId(), dto);
        return ResponseEntity.ok().build();
    }

    // 후기 삭제
    @DeleteMapping("/{reviewId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteReview(
            @PathVariable Long reviewId,
            @AuthenticationPrincipal AuthUserDTO authUserDTO) {
        placeReviewService.deleteReview(reviewId, authUserDTO.getUserId());
        return ResponseEntity.ok().build();
    }

    // 마이페이지 - 내가 쓴 후기
    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<MyPlaceReviewDTO>> getMyReviews(
            @AuthenticationPrincipal AuthUserDTO authUserDTO) {
        return ResponseEntity.ok(placeReviewService.getMyReviews(authUserDTO.getUserId()));
    }

    // 마이페이지 - 작성 가능한 후기
    @GetMapping("/my/pending")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<PendingReviewDTO>> getPendingReviews(
            @AuthenticationPrincipal AuthUserDTO authUserDTO) {
        return ResponseEntity.ok(placeReviewService.getPendingReviews(authUserDTO.getUserId()));
    }
}
