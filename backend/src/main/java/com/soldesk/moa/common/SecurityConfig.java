package com.soldesk.moa.common;

import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

import lombok.extern.log4j.Log4j2;

import java.util.List;

@EnableMethodSecurity // @PreAuthorize, @PostAuthorize 가능
@EnableWebSecurity // 모든 웹 요청에 대해 Security Filter Chain 적용
@Log4j2
@Configuration // 스프링 설정 클래스
public class SecurityConfig {

        // 시큐리티 설정 클래스
        @Bean // == 객체 생성
        SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

                http.authorizeHttpRequests(authorize -> authorize
                                .requestMatchers("/", "/assets/**", "/css/**", "/js/**", "/img/**", "/images/**",
                                                "/vendor/**", "/fonts/**",
                                                "/favicon.ico")
                                .permitAll()
                                .requestMatchers("/auth/**").permitAll()
                                .requestMatchers("/users/**").permitAll()

                                .requestMatchers("/auth/**", "/users/check-nickname").permitAll()
                                .requestMatchers("/users/**").authenticated()

                                // ----------- 보드 시큐리티 파트 ----------
                                // 보드 css, js
                                .requestMatchers("/board/**").permitAll()
                                // board 열람 비회원도 허용(컨트롤러에서 crud 권한 설정예정)
                                .requestMatchers("/notice/**", "/free/**", "/support/**", "/circles/**").permitAll()
                                .requestMatchers("/api/**").permitAll()
                                // board 써클 회원만 열람?(예정)
                                // .requestMatchers("/circle/**").permitAll()
                                // viewcount 비회원도 허용
                                .requestMatchers("/api/posts/*/view").permitAll()
                                // ----------- 보드 시큐리티 끝 ----------

                                // ----------- 써클 -----------
                                .requestMatchers("/auth/rlogin", "/auth/rsignup").permitAll()
                                .requestMatchers("/auth/auth").authenticated()

                                .anyRequest().authenticated());

                // 개발 단계 중 csrf 보호 비활성화
                http.csrf(csrf -> csrf.disable())
                                .cors(cors -> cors.configurationSource(corsConfigurationSource()));

                // // 로그인 form Login 활성화
                http.formLogin(form -> form
                                .loginPage("/auth/login").permitAll()
                                .usernameParameter("email")
                                .passwordParameter("password")
                                .loginProcessingUrl("/auth/login")
                                .failureUrl("/auth/login?error")
                                .defaultSuccessUrl("/", true)
                                .permitAll());

                // 로그아웃 활성화
                http.logout(logout -> logout
                                .logoutUrl("/auth/logout")
                                .invalidateHttpSession(true)
                                .clearAuthentication(true)
                                .deleteCookies("JSESSIONID"));

                return http.build();
        }

        @Bean
        PasswordEncoder passwordEncoder() {
                return PasswordEncoderFactories.createDelegatingPasswordEncoder();
        }

        // 인증 관리자 (로그인 시 사용)
        @Bean
        public AuthenticationManager authenticationManager(
                        AuthenticationConfiguration config) throws Exception {
                return config.getAuthenticationManager();
        }

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration config = new CorsConfiguration();
                config.setAllowedOrigins(List.of("http://localhost:5173"));
                config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
                config.setAllowedHeaders(List.of("*"));
                config.setAllowCredentials(true); // 세션 기반이면 필수

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", config);
                return source;
        }
}
