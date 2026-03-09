package com.soldesk.moa.admin.log.aop;

import java.util.Collection;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import com.soldesk.moa.users.entity.Users;

import lombok.RequiredArgsConstructor;

// @Component  // Users는 @Entity라 Bean으로 주입 불가 - 직접 new CustomUserDetails(user)로 생성해야 함
@RequiredArgsConstructor
public class CustomUserDetails implements UserDetails {
    private final Users user;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'getAuthorities'");
    }

    @Override
    public String getPassword() {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'getPassword'");
    }

    @Override
    public String getUsername() {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'getUsername'");
    }

    public Long getUserId() {
        return user.getUserId();
    }

}
