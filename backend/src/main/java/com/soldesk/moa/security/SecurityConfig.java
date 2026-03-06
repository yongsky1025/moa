package com.soldesk.moa.security;

import java.util.Arrays;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.soldesk.moa.security.oauth2.handler.OAuth2LoginFailureHandler;
import com.soldesk.moa.security.oauth2.handler.OAuth2LoginSuccessHandler;
import com.soldesk.moa.security.oauth2.repository.HttpCookieOAuth2AuthorizationRequestRepository;
import com.soldesk.moa.security.oauth2.service.CustomOAuth2UserService;

import lombok.extern.log4j.Log4j2;

@EnableMethodSecurity
@EnableWebSecurity
@Log4j2
@Configuration
public class SecurityConfig {

        private final CustomOAuth2UserService customOAuth2UserService;
        private final JwtTokenProvider jwtTokenProvider;
        private final UserDetailsService userDetailsService;
        private final OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler;
        private final OAuth2LoginFailureHandler oAuth2LoginFailureHandler;
        private final HttpCookieOAuth2AuthorizationRequestRepository cookieAuthorizationRequestRepository;

        public SecurityConfig(JwtTokenProvider jwtTokenProvider,
                        UserDetailsService userDetailsService,
                        CustomOAuth2UserService customOAuth2UserService,
                        OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler,
                        OAuth2LoginFailureHandler oAuth2LoginFailureHandler,
                        HttpCookieOAuth2AuthorizationRequestRepository cookieAuthorizationRequestRepository) {
                this.jwtTokenProvider = jwtTokenProvider;
                this.userDetailsService = userDetailsService;
                this.customOAuth2UserService = customOAuth2UserService;
                this.oAuth2LoginSuccessHandler = oAuth2LoginSuccessHandler;
                this.oAuth2LoginFailureHandler = oAuth2LoginFailureHandler;
                this.cookieAuthorizationRequestRepository = cookieAuthorizationRequestRepository;
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
                                                                "/assets/**",
                                                                "/css/**",
                                                                "/js/**",
                                                                "/img/**",
                                                                "/images/**",
                                                                "/vendor/**",
                                                                "/fonts/**",
                                                                "/favicon.ico")
                                                .permitAll()
                                                .requestMatchers("/api/auth/**").permitAll()
                                                .requestMatchers("/api/users/profile/check-nickname").permitAll()
                                                .requestMatchers("/oauth2/authorization/**", "/login/oauth2/code/**")
                                                .permitAll()
                                                .anyRequest().authenticated())
                                .oauth2Login(oauth2 -> oauth2
                                                .authorizationEndpoint(endpoint -> endpoint
                                                                .authorizationRequestRepository(
                                                                                cookieAuthorizationRequestRepository))
                                                .userInfoEndpoint(info -> info.userService(customOAuth2UserService))
                                                .successHandler(oAuth2LoginSuccessHandler)
                                                .failureHandler(oAuth2LoginFailureHandler))
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
                configuration.addAllowedOriginPattern("http://localhost:5173");
                configuration.setAllowedMethods(Arrays.asList("HEAD", "GET", "POST", "PUT", "DELETE"));
                configuration.setAllowedHeaders(Arrays.asList("Authorization", "Cache-Control", "Content-Type"));
                configuration.setAllowCredentials(true);

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", configuration);
                return source;
        }

}
