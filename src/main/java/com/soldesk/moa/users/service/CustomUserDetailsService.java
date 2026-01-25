package com.soldesk.moa.users.service;

import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.soldesk.moa.users.dto.AuthUserDTO;
import com.soldesk.moa.users.dto.LoginRequestDTO;
import com.soldesk.moa.users.dto.SignUpRequestDTO;
import com.soldesk.moa.users.entity.Users;
import com.soldesk.moa.users.repository.UsersRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@RequiredArgsConstructor
@Log4j2
@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UsersRepository usersRepository;

    // Security 로그인
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {

        log.info("로그인 요청 : {}", email);
        Users users = usersRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다." + email));

        log.info("로그인 시도: {}", email);

        AuthUserDTO authUserDTO = new AuthUserDTO(users);

        return authUserDTO;

    }
}
