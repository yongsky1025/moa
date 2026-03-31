package com.soldesk.moa.security;

import java.util.Arrays;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.soldesk.moa.common.config.CorsProperties;
import com.soldesk.moa.security.oauth2.handler.OAuth2LoginFailureHandler;
import com.soldesk.moa.security.oauth2.handler.OAuth2LoginSuccessHandler;
import com.soldesk.moa.security.oauth2.repository.HttpCookieOAuth2AuthorizationRequestRepository;
import com.soldesk.moa.security.oauth2.service.CustomOAuth2UserService;

import org.springframework.beans.factory.annotation.Value;

import lombok.extern.log4j.Log4j2;

@EnableMethodSecurity
@EnableWebSecurity
@Log4j2
@Configuration
public class SecurityConfig {

        @Value("${app.frontend-url:http://localhost:5173}")
        private String frontendUrl;

        private final CustomOAuth2UserService customOAuth2UserService;
        private final JwtTokenProvider jwtTokenProvider;
        private final UserDetailsService userDetailsService;
        private final OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler;
        private final OAuth2LoginFailureHandler oAuth2LoginFailureHandler;
        private final HttpCookieOAuth2AuthorizationRequestRepository cookieAuthorizationRequestRepository;
        private final CorsProperties corsProperties;

        public SecurityConfig(JwtTokenProvider jwtTokenProvider,
                        UserDetailsService userDetailsService,
                        CustomOAuth2UserService customOAuth2UserService,
                        OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler,
                        OAuth2LoginFailureHandler oAuth2LoginFailureHandler,
                        HttpCookieOAuth2AuthorizationRequestRepository cookieAuthorizationRequestRepository,
                        CorsProperties corsProperties) {
                this.jwtTokenProvider = jwtTokenProvider;
                this.userDetailsService = userDetailsService;
                this.customOAuth2UserService = customOAuth2UserService;
                this.oAuth2LoginSuccessHandler = oAuth2LoginSuccessHandler;
                this.oAuth2LoginFailureHandler = oAuth2LoginFailureHandler;
                this.cookieAuthorizationRequestRepository = cookieAuthorizationRequestRepository;
                this.corsProperties = corsProperties;
        }

        @Bean
        SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

                http
                                .csrf(csrf -> csrf.disable())
                                .formLogin(form -> form.disable())
                                .httpBasic(basic -> basic.disable())
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                                .authorizeHttpRequests(authorize -> authorize
                                                .requestMatchers(
                                                                "/",
                                                                "/*.html",
                                                                "/assets/**",
                                                                "/css/**",
                                                                "/js/**",
                                                                "/img/**",
                                                                "/images/**",
                                                                "/uploads/**",
                                                                "/vendor/**",
                                                                "/fonts/**",
                                                                "/favicon.ico",
                                                                "/swagger-ui.html",
                                                                "/swagger-ui/**",
                                                                "/v3/api-docs/**",
                                                                "/webjars/**")
                                                .permitAll()

                                                // ----------- user 시큐리티 파트 ---------

                                                .requestMatchers(
                                                                "/api/auth/login",
                                                                "/api/auth/signup",
                                                                "/api/auth/refresh",
                                                                "/api/auth/logout")
                                                .permitAll()
                                                .requestMatchers("/api/users/profile/check-nickname").permitAll()
                                                .requestMatchers("/oauth2/authorization/**", "/login/oauth2/code/**")
                                                .permitAll()
                                                // ----------- 서클 시큐리티 파트 ----------

                                                .requestMatchers(HttpMethod.GET, "/api/circles",
                                                                "/api/circles/categories",
                                                                "/api/circles/*")
                                                .permitAll()

                                                // ----------- 보드 시큐리티 파트 ----------
                                                // 보드 css, js
                                                .requestMatchers("/board/**").permitAll()
                                                // board 열람 비회원도 허용(컨트롤러에서 crud 권한 설정예정)
                                                .requestMatchers("/notice/**", "/free/**", "/support/**").permitAll()
                                                .requestMatchers("/api/notice/**", "/api/free/**", "/api/support/**")
                                                .permitAll()
                                                .requestMatchers(HttpMethod.GET, "/api/boards/global/**").permitAll()
                                                .requestMatchers(HttpMethod.GET, "/api/posts/community").permitAll()
                                                .requestMatchers(HttpMethod.GET, "/api/posts/community/sidebar").permitAll()
                                                .requestMatchers(HttpMethod.GET, "/api/community/activities/**").permitAll()
                                                .requestMatchers("/api/posts/search", "/api/posts/search/**").permitAll()
                                                .requestMatchers(HttpMethod.GET, "/api/posts/search").permitAll()
                                                .requestMatchers(HttpMethod.GET, "/api/posts/*/replies").permitAll()
                                                // board 써클 회원만 열람?(예정)
                                                // .requestMatchers("/circle/**").permitAll()
                                                // viewcount 비회원도 허용
                                                .requestMatchers("/api/posts/*/view").permitAll()
                                                // ----------- 보드 시큐리티 끝 ----------
                                                .requestMatchers("/ws/chat/**", "/ws/chat-raw").permitAll() // WebSocket
                                                                                                            // 핸드셰이크
                                                // 채팅 파일 조회는 인증 없이 허용
                                                .requestMatchers(org.springframework.http.HttpMethod.GET,
                                                                "/api/chat/files/**")
                                                .permitAll()
                                                // 채팅: 로그인한 유저만 접근 허용
                                                .requestMatchers("/chat/**").authenticated()
                                                .requestMatchers("/api/chat/**").authenticated()

                                                // ---------- 관리자----------
                                                .requestMatchers("/api/admin/popular-circles").permitAll() // 메인페이지에
                                                                                                           // 써야할수있으니 허용
                                                .requestMatchers("/api/admin/**").hasRole("ADMIN") // 관리자 security 적용
                                                // ---------------- 장소(place) -----------------
                                                .requestMatchers("/api/places/**").permitAll()
                                                .requestMatchers("/api/tags/**").permitAll() // 장소&일정 태그 다 열어야함
                                                // ----------------------------------
                                                // swagger 임시 허용(개발중)
                                                .requestMatchers("/swagger-ui/**", "/swagger-ui.html",
                                                                "/v3/api-docs/**")
                                                .permitAll()
                                                // ----------------------------------

                                                .anyRequest().authenticated())
                                .oauth2Login(oauth2 -> oauth2
                                                .loginPage(frontendUrl + "/users/login")
                                                .authorizationEndpoint(endpoint -> endpoint
                                                                .authorizationRequestRepository(
                                                                                cookieAuthorizationRequestRepository))
                                                .userInfoEndpoint(info -> info.userService(customOAuth2UserService))
                                                .successHandler(oAuth2LoginSuccessHandler)
                                                .failureHandler(oAuth2LoginFailureHandler))
                                .exceptionHandling(ex -> ex
                                                .authenticationEntryPoint((request, response, authException) -> {
                                                        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                                                        response.setContentType("application/json;charset=UTF-8");
                                                        response.getWriter().write(
                                                                        "{\"status\":401,\"error\":\"Unauthorized\",\"message\":\"Authentication required.\"}");
                                                }))
                                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                                .addFilterBefore(new JwtAuthenticationFilter(jwtTokenProvider, userDetailsService),
                                                UsernamePasswordAuthenticationFilter.class);

                return http.build();
        }

        @Bean
        PasswordEncoder passwordEncoder() {
                return PasswordEncoderFactories.createDelegatingPasswordEncoder();
        }

        @Bean
        CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration configuration = new CorsConfiguration();
                configuration.setAllowedOriginPatterns(corsProperties.getAllowedOriginPatterns());
                configuration.setAllowedMethods(Arrays.asList("HEAD", "GET", "POST", "PUT", "DELETE", "PATCH"));
                configuration.setAllowedHeaders(Arrays.asList("Authorization", "Cache-Control", "Content-Type"));
                configuration.setAllowCredentials(true);

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", configuration);
                return source;
        }

}
