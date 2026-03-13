package com.soldesk.moa.place.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.soldesk.moa.place.dto.PlaceCreateDTO;
import com.soldesk.moa.place.dto.PlaceResponseDTO;
import com.soldesk.moa.place.service.PlaceService;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/place")
@Tag(name = "Place section", description = "Response MOA API")
@Log4j2
public class PlaceController {

    private final PlaceService placeService;

    @PostMapping("/register")
    public Long postRegister(@RequestBody PlaceCreateDTO dto) {
        long id = placeService.createPlace(dto);
        return id;
    }

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

}
