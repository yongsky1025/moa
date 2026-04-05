package com.soldesk.moa.users.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.soldesk.moa.security.JwtTokenProvider;
import com.soldesk.moa.users.dto.energyprofile.EnergyProfileRequestDTO;
import com.soldesk.moa.users.dto.energyprofile.GuestEnergyPreviewResponseDTO;
import com.soldesk.moa.users.dto.energyprofile.GuestEnergyTokenResponseDTO;
import com.soldesk.moa.users.service.GuestEnergyPreviewService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/guest/energy-profile")
@RequiredArgsConstructor
public class GuestEnergyPreviewController {

    private final GuestEnergyPreviewService guestEnergyPreviewService;
    private final JwtTokenProvider jwtTokenProvider;

    @PostMapping("/token")
    public ResponseEntity<GuestEnergyTokenResponseDTO> issueGuestPreviewToken(
            @Valid @RequestBody EnergyProfileRequestDTO request) {
        GuestEnergyTokenResponseDTO response = guestEnergyPreviewService.issueToken(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/preview")
    public ResponseEntity<GuestEnergyPreviewResponseDTO> getGuestPreview(HttpServletRequest request) {

        String token = jwtTokenProvider.extractBearerToken(request);
        GuestEnergyPreviewResponseDTO response = guestEnergyPreviewService.getPreview(token);
        return ResponseEntity.ok(response);
    }

}
