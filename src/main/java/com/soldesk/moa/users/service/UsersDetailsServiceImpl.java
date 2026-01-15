package com.soldesk.moa.users.service;

import org.springframework.boot.autoconfigure.security.SecurityProperties.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.soldesk.moa.users.dto.AuthUsersDTO;
import com.soldesk.moa.users.dto.UsersDTO;
import com.soldesk.moa.users.entity.Users;
import com.soldesk.moa.users.repository.UsersRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@RequiredArgsConstructor
@Log4j2
@Service
public class UsersDetailsServiceImpl implements UserDetailsService {

    private final UsersRepository usersRepository;

    // Security 로그인
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

        log.info("로그인 요청 : {}", username);
        Users users = usersRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("해당하는 회원을 찾을 수 없습니다."));

        UsersDTO usersDTO = UsersDTO.builder()
                .name(users.getName())
                .password(users.getPassword())
                .nickname(users.getNickname())
                .address(users.getAddress())
                .build();

        AuthUsersDTO authUsersDTO = new AuthUsersDTO(usersDTO);

        return authUsersDTO;
    }

}
