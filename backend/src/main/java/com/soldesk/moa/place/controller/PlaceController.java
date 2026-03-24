package com.soldesk.moa.place.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.soldesk.moa.place.dto.NearbyPlaceResponseDTO;
import com.soldesk.moa.place.dto.PlaceResponseDTO;
import com.soldesk.moa.place.service.PlaceService;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/places")
@Tag(name = "Place section", description = "Response MOA API")
@Log4j2
public class PlaceController {

    private final PlaceService placeService;

    @GetMapping("/{id}")
    public PlaceResponseDTO getOnePlace(@PathVariable Long id) {
        return placeService.getPlace(id);
    }

    @GetMapping("/all-place")
    public List<PlaceResponseDTO> getAllPlaces() {
        return placeService.getAllPlaces();
    }

    @GetMapping("/nearby")
    public List<NearbyPlaceResponseDTO> getNearbyPlaces(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam(defaultValue = "3.0") double radius) {
        return placeService.getNearbyPlaces(lat, lng, radius);
    }

}
