package com.soldesk.moa.users.service;

import java.util.Optional;

import org.apache.catalina.User;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.soldesk.moa.users.dto.PasswordDTO;
import com.soldesk.moa.users.dto.SignUpRequestDTO;
import com.soldesk.moa.users.dto.UpdateProfileDTO;
import com.soldesk.moa.users.dto.UserDashBoardDTO;
import com.soldesk.moa.users.entity.Users;
import com.soldesk.moa.users.entity.constant.UserRole;
import com.soldesk.moa.users.repository.UsersRepository;

import lombok.RequiredArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import lombok.extern.log4j.Log4j2;

@RequiredArgsConstructor
@Setter
@Log4j2
@ToString
@Service
public class UsersService {

    private final UsersRepository usersRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    // 회원 가입
    public void signup(SignUpRequestDTO dto) {
        // 이메일 중복 체크
        if (usersRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");
        }

        // 닉네임 중복 체크 추가
        if (usersRepository.existsByNickname(dto.getNickname())) {
            throw new IllegalArgumentException("이미 사용 중인 닉네임입니다.");
        }

        Users user = Users.builder()
                .email(dto.getEmail())
                .password(passwordEncoder.encode(dto.getPassword()))
                .nickname(dto.getNickname())
                .name(dto.getName())
                .userRole(UserRole.USER)
                .address(dto.getAddress())
                .userGender(dto.getUserGender())
                .build();

        usersRepository.save(user);
        log.info("회원가입 완료: {}", dto.getEmail());
    }

    // 닉네임 변경
    @Transactional
    public void nicknameUpdate(UpdateProfileDTO dto) {

        Users users = usersRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("회원 정보를 찾을 수 없습니다."));
        users.changeNickname(dto.getNickname());
    }

    // 비밀번호 변경
    public void passwordUpdate(PasswordDTO dto) throws Exception {

        Users user = usersRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("회원 정보를 찾을 수 없습니다."));

        // 현재 비밀번호(DB)가 입력값과 일치 여부 검증
        if (!passwordEncoder.matches(dto.getCurrentPassword(), user.getPassword())) {
            throw new Exception("현재 비밀번호를 확인해 주세요.");
        } else {
            user.changePassword(passwordEncoder.encode(dto.getNewPassword()));
            usersRepository.save(user);
        }
    }

}
