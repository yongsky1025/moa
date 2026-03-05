package com.soldesk.moa.users.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.soldesk.moa.common.exception.InvalidCredentialsException;
import com.soldesk.moa.common.exception.ResourceNotFoundException;
import com.soldesk.moa.users.dto.account.PasswordUpdateRequestDTO;
import com.soldesk.moa.users.entity.Users;
import com.soldesk.moa.users.repository.UsersRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@RequiredArgsConstructor
@Log4j2
@Service
public class AccountService {

    private final UsersRepository usersRepository;
    private final PasswordEncoder passwordEncoder;

    // 비밀번호 변경
    @Transactional
    public void changePassword(PasswordUpdateRequestDTO dto, Long userId) {
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("회원 정보를 찾을 수 없습니다."));

        if (!passwordEncoder.matches(dto.getCurrentPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("현재 비밀번호를 확인해 주세요.");
        }

        user.changePassword(passwordEncoder.encode(dto.getNewPassword()));
    }

    // 회원 탈퇴
    @Transactional
    public void withdraw(Long userId, String password) {
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("사용자를 찾을 수 없습니다."));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new InvalidCredentialsException("비밀번호가 일치하지 않습니다.");
        }

        user.withdraw();
    }
}
