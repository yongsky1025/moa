package com.soldesk.moa.auth.dto;

import com.soldesk.moa.users.entity.Users;
import com.soldesk.moa.users.entity.constant.UserRole;
import com.soldesk.moa.users.entity.constant.UserStatus;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class AuthUserResponseDTO {
    // 사용자 정보 세션(프론트) 관리
    // 로그인/refresh 시 프론트에 전달할 유저 정보

    private String publicId;
    private String nickname;
    private UserRole userRole;
    private UserStatus userStatus;
    private boolean onboardingCompleted;

    // User entity -> AuthUserResponseDTO
    public static AuthUserResponseDTO from(Users users) {
        return new AuthUserResponseDTO(
                users.getPublicId(),
                users.getNickname(),
                users.getUserRole(),
                users.getUserStatus(),
                users.getOnboardingCompletedAt() != null);
    }
}
