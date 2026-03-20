package com.soldesk.moa.security.oauth2.service;

import java.util.List;
import java.util.Map;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
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
        // TODO: 이메일이 있으면-> 이미 로컬로 로그인했다고 거절. 혹은 이미 소셜로 로그인했다고 거절 -> 차단/탈퇴한 유저의 이메일과 대조
        // 후 다음 단계 넘어가기
        Users user = usersRepository.findByEmail(userInfo.getEmail())
                .map(existingUser -> updateExistingUser(existingUser, provider, userInfo))
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

    // ── provider별 UserInfo 분기 ──

    private OAuth2UserInfo extractUserInfo(String registrationId, Map<String, Object> attributes) {
        return switch (registrationId) {
            case "google" -> new GoogleOAuth2UserInfo(attributes);
            case "kakao" -> new KakaoOAuth2UserInfo(attributes);
            case "naver" -> new NaverOAuth2UserInfo(attributes);
            default -> throw new OAuth2AuthenticationException("지원하지 않는 소셜 로그인: " + registrationId);
        };
    }

    // ── 기존 유저: provider 정보만 연결 ──
    // TODO: 기존 로컬 유저가 소셜로 로그인했을 때, 이메일이 동일하다면 거절, 만일 사용자 요청 시 provider 정보 연결 - 연동 :
    // 추후에 정하기, 여러 가지 생각할게 있음 =

    private Users updateExistingUser(Users user, AuthProvider provider, OAuth2UserInfo userInfo) {
        // 이미 LOCAL 가입된 유저가 소셜 로그인하면 provider 정보를 연결
        // (provider가 아직 설정 안 된 경우에만)
        if (user.getProvider() == null) {
            user.changeProvider(provider);
            user.changeProviderId(userInfo.getId());
        }
        return user;
    }

    // ── 신규 소셜 유저 생성 ──
    private Users signupFromSocial(OAuth2UserInfo userInfo, AuthProvider provider) {
        if (userInfo.getEmail() == null || userInfo.getEmail().isBlank()) {
            throw new OAuth2AuthenticationException("소셜 계정에서 이메일 정보를 가져올 수 없습니다. 이메일 제공 동의가 필요합니다.");
        }
        if (userInfo.getName() == null || userInfo.getName().isBlank()) {
            throw new OAuth2AuthenticationException("소셜 계정에서 이름 정보를 가져올 수 없습니다.");
        }
        String nickname = generateUniqueNickname(userInfo.getName());

        Users newUser = Users.builder()
                .name(userInfo.getName())
                .email(userInfo.getEmail())
                .nickname(nickname)
                .provider(provider)
                .providerId(userInfo.getId())
                .userRole(UserRole.USER)
                .userGender(UserGender.UNSPECIFIED)
                .build();

        return usersRepository.save(newUser);
    }

    // ── 닉네임 중복 방지 (소셜 이름 + 숫자) ──
    // name = 소셜 이름?
    private String generateUniqueNickname(String name) {
        String base = (name != null && !name.isBlank()) ? name : "user";
        String nickname = base;
        int suffix = 1;
        while (usersRepository.existsByNickname(nickname)) {
            nickname = base + suffix++;
        }
        return nickname;
    }
}
