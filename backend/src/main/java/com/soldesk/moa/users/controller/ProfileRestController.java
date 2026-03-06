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
import com.soldesk.moa.users.dto.profile.AddressUpdateRequestDTO;
import com.soldesk.moa.users.dto.profile.NicknameUpdateRequestDTO;
import com.soldesk.moa.users.dto.profile.PhoneUpdateRequestDTO;
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
    @GetMapping("/profile/check-nickname")
    public ResponseEntity<?> checkNickname(@RequestParam String nickname) {
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

    // 휴대전화 번호 변경
    @PreAuthorize("isAuthenticated()")
    @PutMapping("/profile/phone")
    public ResponseEntity<?> changePhone(@AuthenticationPrincipal AuthUserDTO authUser,
            @Valid @RequestBody PhoneUpdateRequestDTO phone) {
        log.info("휴대전화 번호 변경 요청 {}", phone);
        profileService.changePhone(authUser.getUserId(), phone.getPhone());
        return ResponseEntity.ok().build();
    }

    // 주소 변경
    @PreAuthorize("isAuthenticated()")
    @PutMapping("/profile/address")
    public ResponseEntity<?> changeAddress(@AuthenticationPrincipal AuthUserDTO authUser,
            @Valid @RequestBody AddressUpdateRequestDTO address) {
        log.info("주소 변경 요청 {}", authUser);
        profileService.changeAddress(authUser.getUserId(), address.getAddress());
        return ResponseEntity.ok().build();
    }
}
