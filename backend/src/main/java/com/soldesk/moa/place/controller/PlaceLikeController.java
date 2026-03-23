package com.soldesk.moa.place.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.soldesk.moa.common.entity.constant.LikeTargetType;
import com.soldesk.moa.place.dto.PlaceLikiResponseDTO;
import com.soldesk.moa.place.service.PlaceService;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;

@RestController
@Tag(name = "Place like section", description = "Response MOA API")
@RequestMapping("/api/likes/places")
@RequiredArgsConstructor
@Log4j2
public class PlaceLikeController {

    private PlaceService placeService;

    @PostMapping("/{targetType}/{targetId}")
    public ResponseEntity<PlaceLikiResponseDTO> postPlaceLike(
            @PathVariable LikeTargetType targetType,
            @PathVariable Long targetId,
            @AuthenticationPrincipal Long userId) {

        log.info("place like targetType={}, targetId={}, userId={}", targetType, targetId, userId);

        return ResponseEntity.ok(placeService.toggle(userId, targetType, targetId));
    }

}
