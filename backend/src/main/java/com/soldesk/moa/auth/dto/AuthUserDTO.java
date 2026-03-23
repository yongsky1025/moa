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
    // Spring Security 내부 인증/인가용 객체

    private final Long userId; // 내부 PK (서버 내부에서만 사용)
    private final String publicId; // 외부 식별용(UUID)
    private final String nickname;
    private final UserRole role;
    private final UserStatus status;
    private final boolean onboardingCompleted;

    // 소셜로 로그인한 유저의 비밀번호 모름 = 삼항연산자
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
    }

    // 응답용 DTO로 변환 편의 메서드
    public AuthUserResponseDTO toResponse() {
        return new AuthUserResponseDTO(publicId, nickname, role, status, onboardingCompleted);
    }
}
