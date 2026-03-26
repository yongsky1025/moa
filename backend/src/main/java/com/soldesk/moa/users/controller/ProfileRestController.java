package com.soldesk.moa.users.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.soldesk.moa.auth.dto.AuthUserDTO;
import com.soldesk.moa.users.entity.Users;
import com.soldesk.moa.users.dto.profile.NicknameUpdateRequestDTO;
import com.soldesk.moa.users.dto.profile.StatusMessageUpdateRequestDTO;
import com.soldesk.moa.users.dto.profile.UserProfileResponseDTO;
import com.soldesk.moa.users.repository.UsersRepository;
import com.soldesk.moa.users.service.ProfileService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@RequestMapping("/api/users")
@RequiredArgsConstructor
@Log4j2
@RestController
public class ProfileRestController {

    private final UsersRepository usersRepository;
    private final ProfileService profileService;

    // 닉네임 중복 확인 (회원가입 이전에도 사용)
    // 로그인 상태이면 자기 자신의 현재 닉네임은 중복으로 판정하지 않음
    @GetMapping("/profile/check-nickname")
    public ResponseEntity<?> checkNickname(
            @AuthenticationPrincipal AuthUserDTO authUser,
            @RequestParam String nickname) {
        if (authUser != null) {
            Users currentUser = usersRepository.findById(authUser.getUserId()).orElse(null);
            if (currentUser != null && nickname.equals(currentUser.getNickname())) {
                return ResponseEntity.ok().build();
            }
        }
        if (usersRepository.existsByNickname(nickname)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("이미 사용 중인 닉네임입니다.");
        }
        return ResponseEntity.ok().build();
    }

    // 프로필 조회
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/me")
    public ResponseEntity<UserProfileResponseDTO> getMyProfile(@AuthenticationPrincipal AuthUserDTO authUser) {
        log.info("프로필(회원정보 상세) 요청 {}", authUser);
        UserProfileResponseDTO profile = profileService.getMyProfile(authUser.getUserId());
        return ResponseEntity.ok(profile);
    }

    // 닉네임 변경
    @PreAuthorize("isAuthenticated()")
    @PutMapping("/profile/nickname")
    public ResponseEntity<?> changeNickname(@AuthenticationPrincipal AuthUserDTO authUser,
            @Valid @RequestBody NicknameUpdateRequestDTO dto) {
        log.info("닉네임 변경 요청 {}", authUser);
        profileService.changeNickname(authUser.getUserId(), dto.getNickname());
        return ResponseEntity.ok().build();
    }

    // 상태 메시지 변경
    @PreAuthorize("isAuthenticated()")
    @PutMapping("/profile/status-message")
    public ResponseEntity<?> changeStatusMessage(@AuthenticationPrincipal AuthUserDTO authUser,
            @Valid @RequestBody StatusMessageUpdateRequestDTO dto) {
        log.info("상태 메시지 변경 요청 {}", authUser);
        profileService.changeStatusMessage(authUser.getUserId(), dto.getStatusMessage());
        return ResponseEntity.ok().build();
    }

}
