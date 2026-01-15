package com.soldesk.moa.users.service;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.soldesk.moa.users.dto.UsersDTO;
import com.soldesk.moa.users.entity.Users;
import com.soldesk.moa.users.repository.UsersRepository;

import groovy.transform.ToString;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import lombok.extern.log4j.Log4j2;

@RequiredArgsConstructor
@Setter
@Log4j2
@ToString
@Service
public class UsersService implements UserDetailsService {

    private final PasswordEncoder passwordEncoder;
    private final UsersRepository usersRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        throw new UnsupportedOperationException("Unimplemented method 'loadUserByUsername'");
    }

    // 회원 가입
    public void register(UsersDTO dto) {

    }
}
