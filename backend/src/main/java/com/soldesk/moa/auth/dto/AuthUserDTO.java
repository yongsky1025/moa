package com.soldesk.moa.auth.dto;

import java.util.List;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;

import com.soldesk.moa.users.entity.Users;
import com.soldesk.moa.users.entity.constant.UserRole;
import com.soldesk.moa.users.entity.constant.UserStatus;

import lombok.Getter;
import lombok.ToString;

@ToString
@Getter
public class AuthUserDTO extends User {

    private final Long userId;
    private final String publicId;
    private final String nickname;
    private final UserRole role;
    private final UserStatus status;
    private final boolean onboardingCompleted;
    private final boolean privacyAgreed;
    private final String profileImageUrl;

    public AuthUserDTO(Users users) {
        super(
                users.getEmail(),
                users.getPassword() != null ? users.getPassword() : "",
                List.of(new SimpleGrantedAuthority("ROLE_" + users.getUserRole().name())));
        this.userId = users.getUserId();
        this.publicId = users.getPublicId();
        this.nickname = users.getNickname();
        this.role = users.getUserRole();
        this.status = users.getUserStatus();
        this.onboardingCompleted = users.getOnboardingCompletedAt() != null;
        this.privacyAgreed = users.getPrivacyAgreedAt() != null;
        this.profileImageUrl = users.getProfileImageUrl();
    }

    public AuthUserResponseDTO toResponse() {
        return new AuthUserResponseDTO(publicId, nickname, role, status, onboardingCompleted, privacyAgreed,
                profileImageUrl);
    }
}
