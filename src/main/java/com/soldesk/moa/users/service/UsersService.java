package com.soldesk.moa.users.service;

import com.soldesk.moa.users.dto.UserCreateRequestDTO;
import com.soldesk.moa.users.dto.UserResponseDTO;
import com.soldesk.moa.users.entity.Users;
import com.soldesk.moa.users.entity.constant.CustomUserDetails;
import com.soldesk.moa.users.entity.constant.UserRole;
import com.soldesk.moa.users.repository.UsersRepository;
import lombok.RequiredArgsConstructor;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UsersService {

    private final UsersRepository usersRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * 회원가입
     */
    public Users signup(UserCreateRequestDTO dto) {

        // 이메일 중복 체크
        if (usersRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");
        }

        // 닉네임 중복 체크
        if (usersRepository.existsByNickname(dto.getNickname())) {
            throw new IllegalArgumentException("이미 사용 중인 닉네임입니다.");
        }

        // 3️⃣ 비밀번호 암호화 + Users 생성
        Users user = Users.builder()
                .name(dto.getName())
                .email(dto.getEmail())
                .password(passwordEncoder.encode(dto.getPassword()))
                .nickname(dto.getNickname())
                .address(dto.getAddress())
                .userRole(UserRole.USER)
                .build();

        return usersRepository.save(user);
    }

    /**
     * 로그인한 사용자 정보 조회
     */
    public UserResponseDTO getMyInfo(CustomUserDetails userDetails) {
        return UserResponseDTO.from(userDetails.getUser());
    }
}
