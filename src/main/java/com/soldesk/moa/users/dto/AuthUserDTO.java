package com.soldesk.moa.users.dto;

import java.util.List;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;

import com.soldesk.moa.users.entity.Users;

import lombok.Getter;
import lombok.ToString;

@ToString
@Getter
public class AuthUserDTO extends User {

    private final Long userId;
    private final String nickname;

    // 로그인된 사용자(Principal) 인증 정보
    public AuthUserDTO(Users users) {
        super(users.getEmail(), users.getPassword(),
                List.of(new SimpleGrantedAuthority("ROLE_" + users.getUserRole())));
        this.userId = users.getUserId();
        this.nickname = users.getNickname();
    }
}
