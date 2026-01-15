package com.soldesk.moa.users.entity;

import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import lombok.Getter;

@Getter
public class CustomUserDetails implements UserDetails {

    // 실제 우리 서비스에서 사용하는 유저 엔티티
    private final Users user;

    public CustomUserDetails(Users user) {
        this.user = user;
    }

    /**
     * 권한 정보
     * Spring Security는 ROLE_ 접두사를 요구함
     * ex) ADMIN → ROLE_ADMIN
     */
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(() -> "ROLE_" + user.getUserRole().name());
    }

    /**
     * 비밀번호 (DB 저장 값)
     */
    @Override
    public String getPassword() {
        return user.getPassword();
    }

    /**
     * 로그인 ID로 사용할 값
     * → 우리는 email을 로그인 기준으로 사용
     */
    @Override
    public String getUsername() {
        return user.getEmail();
    }

}