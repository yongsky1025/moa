package com.soldesk.moa.place.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.soldesk.moa.place.dto.PlaceDetailResponseDTO;
import com.soldesk.moa.place.dto.PlaceListResponseDTO;
import com.soldesk.moa.place.dto.PlaceRecommendResponseDTO;
import com.soldesk.moa.place.dto.PlaceReviewDetailDTO;
import com.soldesk.moa.place.dto.PlaceSearchDTO;
import com.soldesk.moa.place.service.PlaceImageService;
import com.soldesk.moa.place.service.PlaceRecommendService;
import com.soldesk.moa.place.service.PlaceReviewService;
import com.soldesk.moa.place.service.PlaceService;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import com.soldesk.moa.auth.dto.AuthUserDTO;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/places")
@Tag(name = "Place section", description = "Response MOA API")
@Log4j2
public class PlaceController {

    private final PlaceService placeService;
    private final PlaceImageService placeImageService;
    private final PlaceRecommendService placeRecommendService;
    private final PlaceReviewService placeReviewService;

    @GetMapping("/{id}")
    public PlaceDetailResponseDTO getOnePlace(
            @PathVariable Long id,
            Authentication authentication) {
        Long userId = null;
        if (authentication != null && authentication.getPrincipal() instanceof AuthUserDTO auth) {
            userId = auth.getUserId();
        }
        return placeService.getPlace(id, userId);
    }

    @GetMapping("/{id}/reviews")
    public List<PlaceReviewDetailDTO> getPlaceReviews(@PathVariable Long id) {
        return placeReviewService.getPlaceReviews(id);
    }

    @GetMapping("/all-place")
    public PlaceListResponseDTO searchPlaces(
            @ModelAttribute PlaceSearchDTO searchDTO,
            Authentication authentication) {
        Long userId = null;
        if (authentication != null && authentication.getPrincipal() instanceof AuthUserDTO auth) {
            userId = auth.getUserId();
        }
        return placeService.searchPlaces(searchDTO, userId);
    }

    // @PutMapping("/{id}")
    // public Long putPlaceInfo(@PathVariable Long id, @RequestBody PlaceCreateDTO
    // dto) {

    // return placeService.updatePlace(id, dto);
    // }

    // @DeleteMapping("/{id}")
    // public void deletePlace(@PathVariable Long id) {
    // placeService.deletePlace(id);
    // }

    // 임베딩 유사도 + 거리 기반 장소 추천 (일정 생성 시 사용)
    @GetMapping("/recommend")
    public List<PlaceRecommendResponseDTO> recommendPlaces(
            @RequestParam String title,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) List<String> tags,
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng,
            @RequestParam(defaultValue = "10") int topN) {
        try {
            return placeRecommendService.recommend(title, description, tags, lat, lng, topN);
        } catch (Exception e) {
            log.error("장소 추천 실패: {}", e.getMessage(), e);
            throw e;
        }
    }

    // 장소 이미지 목록 조회 (사용자/관리자 공용)
    @GetMapping("/{id}/images")
    public List<String> getPlaceImages(@PathVariable Long id) {
        return placeImageService.getPlaceImages(id);
    }
}
