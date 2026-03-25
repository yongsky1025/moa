package com.soldesk.moa.place.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.soldesk.moa.place.dto.PlaceCreateDTO;
import com.soldesk.moa.place.dto.PlaceRecommendResponseDTO;
import com.soldesk.moa.place.dto.PlaceResponseDTO;
import com.soldesk.moa.place.service.PlaceRecommendService;
import com.soldesk.moa.place.service.PlaceService;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/place")
@Tag(name = "Place section", description = "Response MOA API")
@Log4j2
public class PlaceController {

    private final PlaceService placeService;
    private final PlaceRecommendService placeRecommendService;

    @GetMapping("/{id}")
    public PlaceResponseDTO getOnePlace(@PathVariable Long id) {
        return placeService.getPlace(id);
    }

    @GetMapping("/all-place")
    public List<PlaceResponseDTO> getAllPlaces() {
        return placeService.getAllPlaces();
    }

    @PutMapping("/{id}")
    public Long putPlaceInfo(@PathVariable Long id, @RequestBody PlaceCreateDTO dto) {

        return placeService.updatePlace(id, dto);
    }

    @DeleteMapping("/{id}")
    public void deletePlace(@PathVariable Long id) {
        placeService.deletePlace(id);
    }

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

}
