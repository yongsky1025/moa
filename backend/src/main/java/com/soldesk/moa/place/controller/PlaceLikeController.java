package com.soldesk.moa.place.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.soldesk.moa.auth.dto.AuthUserDTO;
import com.soldesk.moa.common.entity.constant.LikeTargetType;
import com.soldesk.moa.place.dto.PlaceLikiResponseDTO;
import com.soldesk.moa.place.service.PlaceService;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;

import com.soldesk.moa.place.dto.MyLikedPlaceDTO;

@RestController
@Tag(name = "Place like section", description = "Response MOA API")
@RequestMapping("/api/likes/places")
@RequiredArgsConstructor
@Log4j2
public class PlaceLikeController {

    private final PlaceService placeService;

    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<MyLikedPlaceDTO>> getMyLikedPlaces(
            @AuthenticationPrincipal AuthUserDTO authUserDTO) {
        return ResponseEntity.ok(placeService.getMyLikedPlaces(authUserDTO.getUserId()));
    }

    @PostMapping("/{targetType}/{targetId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PlaceLikiResponseDTO> postPlaceLike(
            @PathVariable LikeTargetType targetType,
            @PathVariable Long targetId,
            @AuthenticationPrincipal AuthUserDTO authUserDTO) {

        log.info("place like targetType={}, targetId={}, userId={}", targetType, targetId, authUserDTO.getUserId());

        return ResponseEntity.ok(placeService.toggle(authUserDTO.getUserId(), targetType, targetId));
    }

}
