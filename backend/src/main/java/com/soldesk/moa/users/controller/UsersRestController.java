package com.soldesk.moa.users.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.soldesk.moa.users.dto.AddressUpdateRequestDTO;
import com.soldesk.moa.users.dto.AuthUserDTO;
import com.soldesk.moa.users.dto.NicknameUpdateRequestDTO;
import com.soldesk.moa.users.dto.PasswordUpdateRequestDTO;
import com.soldesk.moa.users.dto.PhoneUpdateRequestDTO;
import com.soldesk.moa.users.dto.UserProfileResponseDTO;
import com.soldesk.moa.users.repository.UsersRepository;
import com.soldesk.moa.users.service.UsersService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;

@RequestMapping("/users")
@RequiredArgsConstructor
@Log4j2
@RestController
public class UsersRestController {

    private final UsersRepository usersRepository;
    private final UsersService usersService;

    // ============ 닉네임 중복 확인 (회원 가입 시) =============
    @GetMapping("/check-nickname")
    public ResponseEntity<?> checkNickname(@RequestParam String nickname) {
        if (usersRepository.existsByNickname(nickname)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("이미 사용 중인 닉네임입니다.");
        }
        return ResponseEntity.ok().build();
    }

    // =============== 비밀번호 변경 ==============
    @PreAuthorize("isAuthenticated()")
    @PostMapping("/password")
    public ResponseEntity<?> postPwd(@Valid @AuthenticationPrincipal AuthUserDTO authUser,
            @RequestBody PasswordUpdateRequestDTO dto) {
        usersService.passwordUpdate(dto, authUser.getUserId());
        return ResponseEntity.ok().build();
    }

    // ================== 프로필 ==================

    // 프로필 조회
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/me")
    public ResponseEntity<UserProfileResponseDTO> getMyProfile(@AuthenticationPrincipal AuthUserDTO authUser) {
        log.info("프로필(회원정보 상세) 요청 {}", authUser);
        UserProfileResponseDTO profile = usersService.getMyProfile(authUser.getUserId());

        return ResponseEntity.ok(profile);
    }

    // 닉네임(프로필) 변경
    @PreAuthorize("isAuthenticated()")
    @PutMapping("/me/nickname")
    public ResponseEntity<?> changeNickname(@AuthenticationPrincipal AuthUserDTO authUser,
            @Valid @RequestBody NicknameUpdateRequestDTO dto) {
        log.info("닉네임 변경 요청 {}", authUser);

        usersService.updateNickname(authUser.getUserId(), dto.getNickname());

        return ResponseEntity.ok().build();
    }

    // 휴대폰 번호 변경
    @PreAuthorize("isAuthenticated()")
    @PutMapping("/me/phone")
    public ResponseEntity<?> changePhone(@AuthenticationPrincipal AuthUserDTO authUser,
            @Valid @RequestBody PhoneUpdateRequestDTO phone) {
        log.info("휴대폰 번호 변경 요청 {}", phone);
        usersService.updatePhone(authUser.getUserId(), phone.getPhone());

        return ResponseEntity.ok().build();
    }

    // 주소 변경
    @PreAuthorize("isAuthenticated()")
    @PutMapping("/me/address")
    public ResponseEntity<?> changeAddress(@AuthenticationPrincipal AuthUserDTO authUser,
            @Valid @RequestBody AddressUpdateRequestDTO address) {
        log.info("주소 변경 요청 {}", authUser);
        usersService.updateAddress(authUser.getUserId(), address.getAddress());

        return ResponseEntity.ok().build();
    }
}
