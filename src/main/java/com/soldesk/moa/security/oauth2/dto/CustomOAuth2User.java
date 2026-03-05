package com.soldesk.moa.security.oauth2.dto;

import java.util.Collection;
import java.util.Map;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;

import com.soldesk.moa.users.entity.Users;

/**
 * DefaultOAuth2User를 확장하여 Users 엔티티를 함께 보관.
 * OAuth2SuccessHandler에서 JWT 발급 시 유저 정보에 접근하기 위해 사용.
 */
public class CustomOAuth2User extends DefaultOAuth2User {

    private final Users user;

    public CustomOAuth2User(Collection<? extends GrantedAuthority> authorities,
            Map<String, Object> attributes,
            String nameAttributeKey,
            Users user) {
        super(authorities, attributes, nameAttributeKey);
        this.user = user;
    }

    public Users getUser() {
        return user;
    }
}
