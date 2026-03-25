package com.soldesk.moa.place.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.soldesk.moa.place.dto.NearbyPlaceResponseDTO;
import com.soldesk.moa.place.dto.PlaceDetailResponseDTO;
import com.soldesk.moa.place.dto.PlaceListResponseDTO;
import com.soldesk.moa.place.dto.PlaceReviewDTO;
import com.soldesk.moa.place.dto.PlaceSearchDTO;
import com.soldesk.moa.place.dto.TagCategoryGroupDTO;
import com.soldesk.moa.place.service.PlaceImageService;
import com.soldesk.moa.place.service.PlaceService;
import com.soldesk.moa.place.service.TagService;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/places")
@Tag(name = "Place section", description = "Response MOA API")
@Log4j2
public class PlaceController {

    private final PlaceService placeService;
    private final PlaceImageService placeImageService;
    private final TagService tagService;

    @GetMapping("/{id}")
    public PlaceDetailResponseDTO getOnePlace(@PathVariable Long id) {
        return placeService.getPlace(id);
    }

    @GetMapping("/{id}/reviews")
    public List<PlaceReviewDTO> getPlaceReviews(@PathVariable Long id) {
        return placeService.getPlaceReviews(id);
    }

    @GetMapping("/all-place")
    public PlaceListResponseDTO searchPlaces(@ModelAttribute PlaceSearchDTO searchDTO) {
        return placeService.searchPlaces(searchDTO);
    }

    @GetMapping("/nearby")
    public List<NearbyPlaceResponseDTO> getNearbyPlaces(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam(defaultValue = "3.0") double radius) {
        return placeService.getNearbyPlaces(lat, lng, radius);
    }

    // 장소 이미지 목록 조회 (사용자/관리자 공용)
    @GetMapping("/{id}/images")
    public List<String> getPlaceImages(@PathVariable Long id) {
        return placeImageService.getPlaceImages(id);
    }

    // 카테고리별 그룹핑된 태그 전체 조회
    @GetMapping("/tags/grouped")
    public List<TagCategoryGroupDTO> getTagsGrouped() {
        return tagService.getTagsGroupedByCategory();
    }

}
