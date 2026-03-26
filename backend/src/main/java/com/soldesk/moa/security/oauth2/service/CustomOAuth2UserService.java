package com.soldesk.moa.security.oauth2.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.soldesk.moa.security.oauth2.dto.CustomOAuth2User;
import com.soldesk.moa.security.oauth2.dto.GoogleOAuth2UserInfo;
import com.soldesk.moa.security.oauth2.dto.KakaoOAuth2UserInfo;
import com.soldesk.moa.security.oauth2.dto.NaverOAuth2UserInfo;
import com.soldesk.moa.security.oauth2.dto.OAuth2UserInfo;
import com.soldesk.moa.users.entity.Users;
import com.soldesk.moa.users.entity.constant.AuthProvider;
import com.soldesk.moa.users.entity.constant.UserGender;
import com.soldesk.moa.users.entity.constant.UserRole;
import com.soldesk.moa.users.entity.constant.UserStatus;
import com.soldesk.moa.users.repository.UsersRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@RequiredArgsConstructor
@Log4j2
@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UsersRepository usersRepository;

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {

        // 1) 소셜 API 호출 → 사용자 정보 가져오기
        OAuth2User oAuth2User = super.loadUser(userRequest);

        // 2) provider 구분 ("google", "kakao", "naver")
        String registrationId = userRequest.getClientRegistration().getRegistrationId();

        // 유저 정보 속성 추출(서비스마다 달라서, OAuthAttributes 객체로 분리)
        Map<String, Object> attributes = oAuth2User.getAttributes();

        // 3) provider별 UserInfo, provider 추출
        OAuth2UserInfo userInfo = extractUserInfo(registrationId, attributes);
        AuthProvider provider = AuthProvider.valueOf(registrationId.toUpperCase());

        log.info("소셜 로그인 시도: provider={}, email={}", provider, userInfo.getEmail());

        // 4) DB에서 이메일로 유저 조회 → 있으면 업데이트, 없으면 신규 생성
        Users user = usersRepository.findByEmail(userInfo.getEmail())
                .map(existingUser -> handleExistingUser(existingUser, provider, userInfo))
                .orElseGet(() -> signupFromSocial(userInfo, provider));

        log.info("소셜 로그인 성공: email={}, provider={}", user.getEmail(), provider);

        // 5) Spring Security가 사용할 OAuth2User 반환 (Users 엔티티 포함)
        String nameAttributeKey = userRequest.getClientRegistration()
                .getProviderDetails().getUserInfoEndpoint().getUserNameAttributeName();

        return new CustomOAuth2User(
                List.of(new SimpleGrantedAuthority("ROLE_" + user.getUserRole().name())),
                attributes,
                nameAttributeKey,
                user);
    }

    private Users handleExistingUser(Users existingUser, AuthProvider provider, OAuth2UserInfo userInfo) {
        if (existingUser.getUserStatus() == UserStatus.BANNED) {
            throw new OAuth2AuthenticationException(
                    new OAuth2Error("ACCOUNT_BANNED"), "[ACCOUNT_BANNED]영구 정지된 계정입니다.");
        }
        if (existingUser.getUserStatus() == UserStatus.SUSPENDED) {
            throw new OAuth2AuthenticationException(
                    new OAuth2Error("ACCOUNT_SUSPENDED"), "[ACCOUNT_SUSPENDED]활동이 제한된 계정입니다.");
        }
        if (existingUser.getUserStatus() == UserStatus.WITHDRAWN) {
            throw new OAuth2AuthenticationException(
                    new OAuth2Error("ACCOUNT_WITHDRAWN"), "[ACCOUNT_WITHDRAWN]탈퇴한 계정입니다.");
        }

        if (existingUser.getProvider() == null || existingUser.getProvider() == AuthProvider.LOCAL) {
            throw new OAuth2AuthenticationException(
                    new OAuth2Error("local_account"), "이미 로컬 가입된 이메일입니다.");
        }

        if (existingUser.getProvider() != provider) {
            throw new OAuth2AuthenticationException(
                    new OAuth2Error("provider_mismatch"), "이미 다른 소셜 계정으로 가입했습니다.");
        }

        return updateExistingSocialUsers(existingUser, userInfo);
    }

    private Users handleWithdrawnUser(Users existingUser, AuthProvider provider, OAuth2UserInfo userInfo) {
        String existingProviderId = existingUser.getProviderId();
        String currentProviderId = userInfo.getId();
        LocalDateTime now = LocalDateTime.now();

        if (existingUser.isNewSignupBlockedWithinReactive(now)) {
            if (existingUser.getProvider() == null || existingUser.getProvider() == AuthProvider.LOCAL) {
                throw new OAuth2AuthenticationException(
                        new OAuth2Error("withdrawn_local"), "탈퇴 후 6개월 이내에는 로컬 회원 가입으로만 다시 이용할 수 있습니다.");
            }
            if (existingUser.getProvider() != provider) {
                throw new OAuth2AuthenticationException(
                        new OAuth2Error("withdrawn_provider_mismatch"), "탈퇴 후 6개월 이내에는 소셜 로그인으로만 다시 이용할 수 있습니다.");
            }
            if (existingProviderId == null || !existingProviderId.equals(currentProviderId)) {
                throw new OAuth2AuthenticationException(
                        new OAuth2Error("withdrawn_id_mismatch"), "탈퇴 후 6개월 이내로 로컬 회원 가입을 통해 다시 이용할 수 있습니다.");
            }

            existingUser.reactivateSocial(
                    resolveSocialName(userInfo),
                    userInfo.getImageUrl(),
                    userInfo.getId(),
                    provider);
            return existingUser;
        }

        existingUser.anonymizeForReSignup();
        usersRepository.saveAndFlush(existingUser);

        return signupFromSocial(userInfo, provider);

    }

    // ── provider별 UserInfo 분기 ──

    private OAuth2UserInfo extractUserInfo(String registrationId, Map<String, Object> attributes) {
        return switch (registrationId) {
            case "google" -> new GoogleOAuth2UserInfo(attributes);
            case "kakao" -> new KakaoOAuth2UserInfo(attributes);
            case "naver" -> new NaverOAuth2UserInfo(attributes);
            default -> throw new OAuth2AuthenticationException(
                    new OAuth2Error("unsupported_provider"), "지원하지 않는 소셜 로그인: " + registrationId);
        };
    }

    // ── 기존 유저: provider 정보만 연결 ──
    private Users updateExistingSocialUsers(Users user, OAuth2UserInfo userInfo) {
        if (user.getProviderId() != null && !user.getProviderId().equals(userInfo.getId())) {
            throw new OAuth2AuthenticationException(
                    new OAuth2Error("provider_id_mismatch"), "다른 소셜 계정입니다.");
        }

        if (user.getProviderId() == null) {
            user.changeProviderId(userInfo.getId());
        }

        if (userInfo.getImageUrl() != null && !userInfo.getImageUrl().isBlank()) {
            user.changeProfileImageUrl(userInfo.getImageUrl());
        }
        return user;
    }

    // ── 신규 소셜 유저 생성 ──
    private Users signupFromSocial(OAuth2UserInfo userInfo, AuthProvider provider) {
        if (userInfo.getEmail() == null || userInfo.getEmail().isBlank()) {
            throw new OAuth2AuthenticationException(
                    new OAuth2Error("email_missing"), "소셜 계정에서 이메일 정보를 가져올 수 없습니다. 이메일 제공 동의가 필요합니다.");
        }

        String socialName = resolveSocialName(userInfo);
        String tempNickname = generateUniqueNickname(socialName);

        Users newUser = Users.builder()
                .name(socialName)
                .email(userInfo.getEmail())
                .nickname(tempNickname)
                .provider(provider)
                .providerId(userInfo.getId())
                .profileImageUrl(userInfo.getImageUrl())
                .userRole(UserRole.USER)
                .userGender(UserGender.UNSPECIFIED)
                .build();

        return usersRepository.save(newUser);
    }

    // Social 회원 가입자 name = email의 @ 앞자리로 입력
    private String resolveSocialName(OAuth2UserInfo userInfo) {
        if (userInfo.getName() != null && !userInfo.getName().isBlank()) {
            return userInfo.getName();
        }

        String email = userInfo.getEmail();

        if (email != null && email.contains("@")) {
            return email.substring(0, email.indexOf("@"));
        }

        return "social_user";
    }

    // ── 닉네임 중복 방지 (소셜 이름 + 숫자) ──
    private String generateUniqueNickname(String baseName) {
        String base = (baseName != null && !baseName.isBlank()) ? baseName : "user";
        String nickname = base;
        int suffix = 1;

        while (usersRepository.existsByNickname(nickname)) {
            nickname = base + suffix++;
        }
        return nickname;
    }
}
