package com.soldesk.moa.users.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.soldesk.moa.common.exception.DuplicateResourceException;
import com.soldesk.moa.common.exception.ResourceNotFoundException;
import com.soldesk.moa.users.dto.profile.UserProfileResponseDTO;
import com.soldesk.moa.users.entity.Users;
import com.soldesk.moa.users.repository.UsersRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@RequiredArgsConstructor
@Log4j2
@Service
public class ProfileService {

    private final UsersRepository usersRepository;

    // 프로필 조회
    @Transactional(readOnly = true)
    public UserProfileResponseDTO getMyProfile(Long userId) {
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("사용자를 찾을 수 없습니다."));

        return UserProfileResponseDTO.builder()
                .name(user.getName())
                .nickname(user.getNickname())
                .email(user.getEmail())
                .userGender(user.getUserGender())
                .birthDate(user.getBirthDate())
                .age(user.getAge())
                .statusMessage(user.getStatusMessage())
                .build();
    }

    // 상태 메시지 변경
    @Transactional
    public void changeStatusMessage(Long userId, String statusMessage) {
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("사용자를 찾을 수 없습니다."));
        user.changeStatusMessage(statusMessage);
    }

    // 닉네임 변경
    @Transactional
    public void changeNickname(Long userId, String nickname) {
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("사용자를 찾을 수 없습니다."));

        if (user.getNickname().equals(nickname)) {
            return;
        }

        if (usersRepository.existsByNickname(nickname)) {
            throw new DuplicateResourceException("이미 사용 중인 닉네임입니다.");
        }

        user.changeNickname(nickname);
    }

}
