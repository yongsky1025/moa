package com.soldesk.moa.auth.dto;

public record AuthTokenBundleDTO(
        String accessToken,
        String refreshToken,
        AuthUserResponseDTO user) {
}

