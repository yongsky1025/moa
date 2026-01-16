package com.soldesk.moa.users.service;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.soldesk.moa.users.entity.Users;
import com.soldesk.moa.users.entity.constant.CustomUserDetails;
import com.soldesk.moa.users.repository.UsersRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UsersRepository usersRepository;

    /**
     * 로그인 요청 시 Spring Security가 자동 호출
     * email = Username
     */
    @Override
    public UserDetails loadUserByUsername(String email) {
        System.out.println("로그인 시도 이메일: " + email);

        // DB에서 유저 조회
        Users user = usersRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("유저 없음"));

        // Users → CustomUserDetails로 감싸서 반환
        return new CustomUserDetails(user);
    }
}