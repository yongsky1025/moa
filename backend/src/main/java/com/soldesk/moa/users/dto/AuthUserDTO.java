package com.soldesk.moa.users.dto;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;

import com.soldesk.moa.users.entity.Users;
import com.soldesk.moa.users.entity.constant.UserRole;
import com.soldesk.moa.users.entity.constant.UserStatus;

import lombok.Getter;

import java.util.List;

@Getter
// 서버 내부 인증용 식별자
public class AuthUserDTO extends User {

    private final Long userId; // 내부 식별자 (DB PK) - 서버 내부에서만 사용
    private final String publicId; // 외부 식별자(UUID)
    private final String nickname;
    private final UserRole role;
    private final UserStatus status;

    public AuthUserDTO(Users users) {
        super(
                users.getEmail(),
                users.getPassword(),
                List.of(new SimpleGrantedAuthority("ROLE_" + users.getUserRole().name())));

        this.userId = users.getUserId();
        this.publicId = users.getPublicId();
        this.nickname = users.getNickname();
        this.role = users.getUserRole();
        this.status = users.getUserStatus();
    }
}
