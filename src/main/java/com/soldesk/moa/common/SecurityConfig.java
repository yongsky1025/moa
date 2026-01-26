package com.soldesk.moa.common;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

import lombok.extern.log4j.Log4j2;

@EnableMethodSecurity // @PreAuthorize, @PostAuthorize 가능
@EnableWebSecurity // 모든 웹 요청에 대해 Security Filter Chain 적용
@Log4j2
@Configuration // 스프링 설정 클래스
public class SecurityConfig {

        // 시큐리티 설정 클래스
        @Bean // == 객체 생성
        SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

                http.authorizeHttpRequests(authorize -> authorize
                                .requestMatchers("/", "/css/**",
                                                "/js/**",
                                                "/img/**",
                                                "/images/**",
                                                "/assets/**",
                                                "/vendor/**",
                                                "/fonts/**",
                                                "/favicon.ico", "/users/js/**")
                                .permitAll()
                                .requestMatchers("/auth/**").permitAll()
                                .requestMatchers("/users/**").permitAll()
                                // viewcount 비회원도 허용
                                .requestMatchers("/api/posts/*/view").permitAll()

                                .anyRequest().authenticated());

                // 개발 단계 중 csrf 보호 비활성화
                http.csrf(csrf -> csrf.disable());

                // // 로그인 form Login 활성화
                http.formLogin(form -> form
                                .loginPage("/auth/login").permitAll()
                                .usernameParameter("email")
                                .passwordParameter("password")
                                .loginProcessingUrl("/auth/login")
                                .defaultSuccessUrl("/users/profile", true)
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
}
