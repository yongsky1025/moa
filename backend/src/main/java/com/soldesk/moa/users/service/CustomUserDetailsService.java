package com.soldesk.moa.users.service;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.soldesk.moa.auth.dto.AuthUserDTO;
import com.soldesk.moa.common.exception.UserNotActiveException;
import com.soldesk.moa.users.entity.Users;
import com.soldesk.moa.users.entity.constant.UserStatus;
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

        Users user = usersRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다." + email));

        if (user.getUserStatus() == UserStatus.WITHDRAWN) {
            throw new UserNotActiveException("ACCOUNT_WITHDRAWN", "탈퇴한 계정입니다.");
        }
        if (user.getUserStatus() == UserStatus.SUSPENDED) {
            throw new UserNotActiveException("ACCOUNT_SUSPENDED", "일시 중지된 계정입니다.");
        }
        if (user.getUserStatus() == UserStatus.BANNED) {
            throw new UserNotActiveException("ACCOUNT_BANNED", "영구 정지된 계정입니다.");
        }

        log.info("로그인 시도: {}", email);

        AuthUserDTO authUserDTO = new AuthUserDTO(user);

        return authUserDTO;

    }
}
