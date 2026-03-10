package com.soldesk.moa;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;

// @Disabled
@SpringBootTest
class MoaApplicationTests {

	// [테스트 환경 임시 처리]
	// SecurityConfig에서 .oauth2Login()을 사용하기 때문에
	// Spring이 구글/네이버/카카오 OAuth2 클라이언트 설정값(application-oauth2.yml)을 요구함.
	// 실제 운영/개발 환경에서는 application-oauth2.yml에 각 소셜 로그인 client-id, client-secret 등을 설정해야 함.
	// 테스트 환경에서는 해당 파일이 없으므로 @MockBean으로 가짜 Bean을 주입해 컨텍스트 로드 오류를 방지함.
	// @MockBean
	// ClientRegistrationRepository clientRegistrationRepository;

	@Test
	void contextLoads() {
	}

}
