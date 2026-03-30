package com.soldesk.moa.auth.service;

import java.time.LocalDateTime;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.soldesk.moa.auth.dto.AuthTokenBundleDTO;
import com.soldesk.moa.auth.dto.AuthUserResponseDTO;
import com.soldesk.moa.auth.dto.LoginRequestDTO;
import com.soldesk.moa.auth.dto.SignUpRequestDTO;
import com.soldesk.moa.auth.dto.SocialSignUpCompleteRequestDTO;
import com.soldesk.moa.common.exception.DuplicateResourceException;
import com.soldesk.moa.common.exception.InvalidCredentialsException;
import com.soldesk.moa.common.exception.InvalidRequestException;
import com.soldesk.moa.common.exception.UserNotActiveException;
import com.soldesk.moa.security.JwtTokenProvider;
import com.soldesk.moa.users.entity.Users;
import com.soldesk.moa.users.entity.constant.AuthProvider;
import com.soldesk.moa.users.entity.constant.UserRole;
import com.soldesk.moa.users.entity.constant.UserStatus;
import com.soldesk.moa.users.repository.UsersRepository;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class AuthService {

    private final JwtTokenProvider jwtTokenProvider;
    private final UsersRepository usersRepository;
    private final PasswordEncoder passwordEncoder;
    private final RefreshTokenService refreshTokenService;

    @Transactional
    public void signup(SignUpRequestDTO dto) {

        Users existingUser = usersRepository.findByEmail(dto.getEmail()).orElse(null);

        if (existingUser != null) {
            handleExistingUserOnSignup(existingUser, dto);
            return;
        }

        validateNewNickname(dto.getNickname());
        usersRepository.save(buildLocalUser(dto));
    }

    public AuthTokenBundleDTO login(LoginRequestDTO req) {
        Users user = usersRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new InvalidCredentialsException("이메일 또는 비밀번호가 올바르지 않습니다."));

        // 계정 상태 먼저 확인 (탈퇴/정지/차단 → 403 + errorCode)
        validateLoginStatus(user);

        if (isSocialAccount(user) && user.getPassword() == null) {
            throw new InvalidCredentialsException("소셜 로그인으로 가입한 계정입니다.");
        }

        if (user.getPassword() == null || !passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("이메일 또는 비밀번호가 올바르지 않습니다.");
        }

        String accessToken = jwtTokenProvider.createAccessToken(user.getEmail(), user.getUserRole(), user.getUserId());
        String refreshToken = refreshTokenService.createAndStoreRefreshToken(user);

        return new AuthTokenBundleDTO(accessToken, refreshToken, AuthUserResponseDTO.from(user));
    }

    @Transactional
    public AuthTokenBundleDTO refresh(String refreshToken) {
        Users user = refreshTokenService.validateRefreshTokenAndGetUser(refreshToken);

        if (user.getUserStatus() != UserStatus.ACTIVE) {
            validateLoginStatus(user);
        }

        String newAccessToken = jwtTokenProvider.createAccessToken(user.getEmail(), user.getUserRole(),
                user.getUserId());
        String newRefreshToken = refreshTokenService.createAndStoreRefreshToken(user);

        return new AuthTokenBundleDTO(newAccessToken, newRefreshToken, AuthUserResponseDTO.from(user));
    }

    @Transactional
    public void logout(String refreshToken) {
        refreshTokenService.revoke(refreshToken);
    }

    @Transactional(readOnly = true)
    public AuthUserResponseDTO getAuthUser(String email) {
        Users user = usersRepository.findByEmail(email)
                .orElseThrow(() -> new InvalidCredentialsException("User not found."));
        return AuthUserResponseDTO.from(user);
    }

    @Transactional
    public void agreePrivacy(String email) {
        Users user = usersRepository.findByEmail(email)
                .orElseThrow(() -> new InvalidCredentialsException("User not found."));

        user.agreePrivacy();
    }

    @Transactional
    public void completeSocialSignUp(String email, SocialSignUpCompleteRequestDTO dto) {
        Users user = usersRepository.findByEmail(email)
                .orElseThrow(() -> new InvalidCredentialsException("User not found."));

        if (!user.needsSocialSignUp()) {
            throw new InvalidRequestException("이미 추가 정보가 입력된 계정입니다.");
        }

        validateSocialNickname(user, dto.getNickname());
        user.changeNickname(dto.getNickname());
        user.completeSocialSignUp(dto.getBirthDate(), dto.getUserGender());
    }

    // 기존 회원이 재가입 할 때의 대응
    private void handleExistingUserOnSignup(Users existingUser, SignUpRequestDTO dto) {
        if (existingUser.getUserStatus() == UserStatus.BANNED) {
            throw new InvalidRequestException("영구 정지된 계정입니다.");
        }
        if (existingUser.getUserStatus() == UserStatus.SUSPENDED) {
            throw new InvalidRequestException("활동이 제한된 계정입니다.");
        }
        if (existingUser.getUserStatus() == UserStatus.WITHDRAWN) {
            handleWithdrawnUserSignup(existingUser, dto);
            return;
        }

        // 소셜 회원이 로컬로 회원 가입 시, 회원 가입 차단
        if (isSocialAccount(existingUser)) {
            throw new DuplicateResourceException("이미 소셜로 가입된 이메일입니다.");
        }

        throw new DuplicateResourceException("이미 가입된 이메일입니다.");
    }

    private void handleWithdrawnUserSignup(Users existingUser, SignUpRequestDTO dto) {
        if (isSocialAccount(existingUser)) {
            throw new InvalidRequestException("이미 소셜로 가입한 이메일입니다.");
        }

        LocalDateTime now = LocalDateTime.now();

        if (existingUser.isNewSignupBlockedWithinReactive(now)) {
            validateNicknameForReactivation(existingUser, dto.getNickname());
            existingUser.reactivateLocal(
                    dto.getName(),
                    dto.getNickname(),
                    passwordEncoder.encode(dto.getPassword()),
                    dto.getBirthDate(),
                    dto.getUserGender());
            return;
        }

        existingUser.anonymizeForReSignup();
        usersRepository.saveAndFlush(existingUser);

        validateNewNickname(dto.getNickname());
        usersRepository.save(buildLocalUser(dto));

    }

    // UserStatus에 따른 로그인 유효성 검증
    private void validateLoginStatus(Users user) {
        if (user.getUserStatus() == UserStatus.ACTIVE) {
            return;
        }

        if (user.getUserStatus() == UserStatus.WITHDRAWN) {
            throw new UserNotActiveException("ACCOUNT_WITHDRAWN", "탈퇴한 계정입니다.");
        }
        if (user.getUserStatus() == UserStatus.SUSPENDED) {
            throw new UserNotActiveException("ACCOUNT_SUSPENDED", "활동이 제한된 계정입니다.");
        }
        if (user.getUserStatus() == UserStatus.BANNED) {
            throw new UserNotActiveException("ACCOUNT_BANNED", "영구 정지된 계정입니다.");
        }
        throw new UserNotActiveException("ACCOUNT_INACTIVE", "로그인할 수 없는 계정입니다.");
    }

    private void validateNewNickname(String nickname) {
        if (usersRepository.existsByNickname(nickname)) {
            throw new DuplicateResourceException("이미 사용 중인 닉네임입니다.");
        }
    }

    private void validateNicknameForReactivation(Users existingUser, String nickname) {
        if (existingUser.getNickname().equals(nickname)) {
            return;
        }
        if (usersRepository.existsByNickname(nickname)) {
            throw new DuplicateResourceException("이미 사용 중인 닉네임입니다.");
        }
    }

    // 소셜 회원가입 추가 정보 입력 시 닉네임 유효성 검사
    private void validateSocialNickname(Users user, String nickname) {
        if (user.getNickname().equals(nickname)) {
            return;
        }

        if (usersRepository.existsByNickname(nickname)) {
            throw new DuplicateResourceException("이미 사용 중인 닉네임입니다.");
        }
    }

    // Provider가 Local이 아니면 소셜 계정
    private boolean isSocialAccount(Users user) {
        return user.getProvider() != null && user.getProvider() != AuthProvider.LOCAL;
    }

    private Users buildLocalUser(SignUpRequestDTO dto) {
        return Users.builder()
                .name(dto.getName())
                .nickname(dto.getNickname())
                .email(dto.getEmail())
                .password(passwordEncoder.encode(dto.getPassword()))
                .provider(AuthProvider.LOCAL)
                .userRole(UserRole.USER)
                .userGender(dto.getUserGender())
                .birthDate(dto.getBirthDate())
                .privacyAgreedAt(LocalDateTime.now())
                .build();
    }
}
