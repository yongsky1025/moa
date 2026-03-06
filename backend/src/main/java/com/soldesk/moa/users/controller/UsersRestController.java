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

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

import java.util.Map;

import org.apache.catalina.connector.Response;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
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

    // =========== 로그(메시지):성공, 실패 헬퍼 메서드 ===========
    private ResponseEntity<?> success(String message) {
        return ResponseEntity.ok(Map.of("message", message));
    }

    private ResponseEntity<?> error(String message) {
        return ResponseEntity.badRequest().body(Map.of("error", message));
    }

    // =========== 로그아웃/탈퇴 ===========

    // 로그아웃 (postman - post)
    @PreAuthorize("isAuthenticated()")
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {

        // 2. 세션 무효화
        HttpSession session = httpRequest.getSession(false);
        if (session != null) {
            session.invalidate();
        }

        // 3. SecurityContect 초기화
        SecurityContextHolder.clearContext();

        // 4. 쿠키 삭제
        Cookie cookie = new Cookie("JSESSIONID", null);
        cookie.setMaxAge(0);
        cookie.setPath("/");
        httpResponse.addCookie(cookie);

        log.info("로그아웃 완료");

        return success("로그아웃 되었습니다.");

    }

    // 회원 탈퇴()
    @PreAuthorize("isAuthenticated()")
    @DeleteMapping("/me")
    public ResponseEntity<?> withdrawAccount(@AuthenticationPrincipal AuthUserDTO authUser,
            @RequestBody Map<String, String> request, HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {

        try {
            String password = request.get("password");

            // 1. 탈퇴 처리
            usersService.withdrawAccount(authUser.getUserId(), password);

            // 2. 세션 무효화
            HttpSession session = httpRequest.getSession(false);
            if (session != null) {
                session.invalidate();
            }

            // 3. SecurityContect 초기화
            SecurityContextHolder.clearContext();

            // 4. 쿠키 삭제
            Cookie cookie = new Cookie("JSESSIONID", null);
            cookie.setMaxAge(0);
            cookie.setPath("/");
            httpResponse.addCookie(cookie);

            return ResponseEntity.ok(Map.of("message", "회원 탈퇴가 완료되었습니다.", "userId", authUser.getUserId()));

            // 비밀번호 불일치
        } catch (IllegalArgumentException e) {
            return error("비밀번호가 일치하지 않습니다.");

            // 회원 탈퇴 실패
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "회원 탈퇴 중 오류가 발생했습니다."));
        }

    }

    // ============ 닉네임 중복 확인 (회원 가입 시) =============
    @GetMapping("/check-nickname")
    public ResponseEntity<?> checkNickname(@RequestParam String nickname) {
        if (usersRepository.existsByNickname(nickname)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", "이미 사용 중인 닉네임입니다."));
        }
        return success("사용 가능한 닉네임입니다.");
    }

    // =============== 비밀번호 변경 ==============
    @PreAuthorize("isAuthenticated()")
    @PostMapping("/password")
    public ResponseEntity<?> changePassword(
            @AuthenticationPrincipal AuthUserDTO authUser,
            @Valid @RequestBody PasswordUpdateRequestDTO dto) {

        try {
            usersService.passwordUpdate(dto, authUser.getUserId());
            return success("비밀번호가 변경되었습니다.");
        } catch (RuntimeException e) {
            return error("비밀번호 변경에 실패했습니다.");
        }
    }

    // ================== 프로필 ==================

    // 프로필 조회
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/me")
    public ResponseEntity<?> getProfile(@AuthenticationPrincipal AuthUserDTO authUser) {
        UserProfileResponseDTO profile = usersService.getMyProfile(authUser.getUserId());
        return ResponseEntity.ok(Map.of("message", "조회 완료", "data", profile));
    }

    // 닉네임(프로필) 변경
    @PreAuthorize("isAuthenticated()")
    @PutMapping("/me/nickname")
    public ResponseEntity<?> changeNickname(
            @AuthenticationPrincipal AuthUserDTO authUser,
            @Valid @RequestBody NicknameUpdateRequestDTO dto) {

        try {
            usersService.updateNickname(authUser.getUserId(), dto.getNickname());
            return success("닉네임이 변경되었습니다.");
        } catch (RuntimeException e) {
            return error("닉네임 변경에 실패했습니다.");
        }
    }

    // 휴대폰 번호 변경
    @PreAuthorize("isAuthenticated()")
    @PutMapping("/me/phone")
    public ResponseEntity<?> changePhone(
            @AuthenticationPrincipal AuthUserDTO authUser,
            @Valid @RequestBody PhoneUpdateRequestDTO dto) {
        usersService.updatePhone(authUser.getUserId(), dto.getPhone());
        return success("핸드폰 번호가 변경되었습니다.");
    }

    // 주소 변경
    @PreAuthorize("isAuthenticated()")
    @PutMapping("/me/address")
    public ResponseEntity<?> changeAddress(
            @AuthenticationPrincipal AuthUserDTO authUser,
            @Valid @RequestBody AddressUpdateRequestDTO dto) {
        usersService.updateAddress(authUser.getUserId(), dto.getAddress());
        return success("주소가 변경되었습니다.");
    }
}
