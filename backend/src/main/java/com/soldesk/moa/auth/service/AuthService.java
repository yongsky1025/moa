package com.soldesk.moa.auth.service;

import java.time.LocalDateTime;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

import com.soldesk.moa.auth.dto.AuthTokenBundleDTO;
import com.soldesk.moa.auth.dto.AuthUserResponseDTO;
import com.soldesk.moa.auth.dto.LoginRequestDTO;
import com.soldesk.moa.auth.dto.SignUpRequestDTO;
import com.soldesk.moa.common.exception.DuplicateResourceException;
import com.soldesk.moa.common.exception.InvalidCredentialsException;
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
        if (usersRepository.existsByEmail(dto.getEmail())) {
            throw new DuplicateResourceException("Email already in use.");
        }

        if (usersRepository.existsByNickname(dto.getNickname())) {
            throw new DuplicateResourceException("Nickname already in use.");
        }

        Users user = Users.builder()
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

        usersRepository.save(user);
    }

    public AuthTokenBundleDTO login(LoginRequestDTO req) {
        Users user = usersRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password."));

        if (user.getPassword() == null || !passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("Invalid email or password.");
        }

        if (user.getUserStatus() != UserStatus.ACTIVE) {
            throw new UserNotActiveException("User is not active.");
        }

        String accessToken = jwtTokenProvider.createAccessToken(user.getEmail(), user.getUserRole());
        String refreshToken = refreshTokenService.createAndStoreRefreshToken(user);

        return new AuthTokenBundleDTO(accessToken, refreshToken, AuthUserResponseDTO.from(user));
    }

    @Transactional
    public AuthTokenBundleDTO refresh(String refreshToken) {
        Users user = refreshTokenService.validateRefreshTokenAndGetUser(refreshToken);

        if (user.getUserStatus() != UserStatus.ACTIVE) {
            throw new UserNotActiveException("User is not active.");
        }

        String newAccessToken = jwtTokenProvider.createAccessToken(user.getEmail(), user.getUserRole());
        String newRefreshToken = refreshTokenService.createAndStoreRefreshToken(user);

        return new AuthTokenBundleDTO(newAccessToken, newRefreshToken, AuthUserResponseDTO.from(user));
    }

    @Transactional
    public void logout(String refreshToken) {
        refreshTokenService.revoke(refreshToken);
    }
}
