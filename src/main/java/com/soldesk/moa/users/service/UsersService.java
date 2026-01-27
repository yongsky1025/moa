package com.soldesk.moa.users.service;

import java.time.LocalDate;
import java.time.Period;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.soldesk.moa.users.dto.AuthUserDTO;
import com.soldesk.moa.users.dto.PasswordUpdateRequestDTO;
import com.soldesk.moa.users.dto.SignUpRequestDTO;
import com.soldesk.moa.users.dto.UserProfileResponseDTO;
import com.soldesk.moa.users.entity.Users;
import com.soldesk.moa.users.entity.constant.UserRole;
import com.soldesk.moa.users.repository.UsersRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.ToString;
import lombok.extern.log4j.Log4j2;

@RequiredArgsConstructor
@Log4j2
@ToString
@Service
public class UsersService {

    private final UsersRepository usersRepository;
    private final PasswordEncoder passwordEncoder;

    // ================ 회원가입 관련 ===================
    @Transactional
    // 회원 가입
    public Long signup(SignUpRequestDTO dto) {
        // 이메일 중복 체크
        if (usersRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");
        }

        // 닉네임 중복 체크 추가
        if (usersRepository.existsByNickname(dto.getNickname())) {
            throw new IllegalArgumentException("이미 사용 중인 닉네임입니다.");
        }

        Users user = Users.builder()
                .name(dto.getName())
                .nickname(dto.getNickname())
                .email(dto.getEmail())
                .password(passwordEncoder.encode(dto.getPassword()))
                .address(dto.getAddress())
                .userRole(UserRole.USER)
                .userGender(dto.getUserGender())
                .birthDate(dto.getBirthDate())
                .phone(dto.getPhone())
                .age(dto.getAge())
                .build();

        return usersRepository.save(user).getUserId();
    }

    // ================ 비밀번호 변경 관련 ===================
    // 비밀번호 변경
    @Transactional
    public void passwordUpdate(PasswordUpdateRequestDTO dto, Long userId) {
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("회원 정보를 찾을 수 없습니다."));

        // 현재 비밀번호(DB)가 입력값과 일치 여부 검증
        if (!passwordEncoder.matches(dto.getCurrentPassword(), user.getPassword())) {
            throw new RuntimeException("현재 비밀번호를 확인해 주세요.");
        }

        user.changePassword(passwordEncoder.encode(dto.getNewPassword()));

        Authentication authentication = getAuthentication();
        AuthUserDTO newPrincipal = new AuthUserDTO(user);
        Authentication newAuth = new UsernamePasswordAuthenticationToken(
                newPrincipal, authentication.getCredentials(), newPrincipal.getAuthorities());

        SecurityContextHolder.getContext().setAuthentication(newAuth);
    }

    // ================ 프로필 관련 ===================
    // 프로필 조회
    @Transactional(readOnly = true)
    public UserProfileResponseDTO getMyProfile(Long userId) {
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("사용자를 찾을 수 없습니다."));

        return UserProfileResponseDTO.builder()
                .name(user.getName())
                .nickname(user.getNickname())
                .address(user.getAddress())
                .email(user.getEmail())
                .phone(user.getPhone())
                .userGender(user.getUserGender())
                .birthDate(user.getBirthDate())
                .age(user.getAge())
                .build();
    }

    // 닉네임 변경
    @Transactional
    public void updateNickname(Long userId, String nickname) {
        Users users = usersRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("사용자를 찾을 수 없습니다."));

        // 1) 변경할 닉네임이 현재와 같으면 변경 불필요
        if (users.getNickname().equals(nickname)) {
            return;
        }

        // 2) 닉네임 중복 (선택)
        if (usersRepository.existsByNickname(nickname)) {
            throw new RuntimeException("이미 사용 중인 닉네임입니다.");
        }

        users.changeNickname(nickname);

        Authentication authentication = getAuthentication();
        AuthUserDTO newPrincipal = new AuthUserDTO(users);

        Authentication newAuth = new UsernamePasswordAuthenticationToken(
                newPrincipal, authentication.getCredentials(), newPrincipal.getAuthorities());

        SecurityContextHolder.getContext().setAuthentication(newAuth);
    }

    // 핸드폰 번호 변경
    @Transactional
    public void updatePhone(Long userId, String phone) {
        Users users = usersRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("사용자를 찾을 수 없습니다."));
        users.changePhone(phone);
    }

    // 주소 변경
    @Transactional
    public void updateAddress(Long userId, String address) {
        Users users = usersRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("사용자를 찾을 수 없습니다."));
        users.changeAddress(address);
    }

    // ================ 세션 관련 ===================
    // 세션 정보 변경(필요 메서드)
    private Authentication getAuthentication() {
        SecurityContext context = SecurityContextHolder.getContext();
        Authentication authentication = context.getAuthentication();
        return authentication;
    }
}
