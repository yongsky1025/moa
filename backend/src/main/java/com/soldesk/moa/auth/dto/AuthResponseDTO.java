package com.soldesk.moa.auth.dto;

import com.soldesk.moa.users.entity.Users;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AuthResponseDTO {
    // 로그인/refresh token 발급 응답
    // RTK {accessToken, user} 쿠키 외에 전달되는 login/refresh 응답(전체)

    private String accessToken;
    private AuthUserResponseDTO user;

    public static AuthResponseDTO of(String accessToken, Users users) {
        return new AuthResponseDTO(accessToken, AuthUserResponseDTO.from(users));
    }

    public static AuthResponseDTO of(String accessToken, AuthUserDTO principal) {
        return new AuthResponseDTO(accessToken, principal.toResponse());
    }
}
