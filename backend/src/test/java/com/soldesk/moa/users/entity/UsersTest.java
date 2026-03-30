package com.soldesk.moa.users.entity;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.LocalDateTime;

import org.junit.jupiter.api.Test;

import com.soldesk.moa.users.entity.constant.UserGender;
import com.soldesk.moa.users.entity.constant.UserRole;

class UsersTest {

    @Test
    void shouldRequireSocialSignUpWhenConsentAndRequiredProfileInfoAreMissing() {
        Users user = Users.builder()
                .name("social user")
                .email("social@example.com")
                .nickname("social-user")
                .userRole(UserRole.USER)
                .userGender(UserGender.UNSPECIFIED)
                .build();

        assertTrue(user.needsSocialSignUp());
    }

    @Test
    void shouldStillRequireSocialSignUpAfterPrivacyConsentOnly() {
        Users user = Users.builder()
                .name("half done user")
                .email("half@example.com")
                .nickname("half-user")
                .userRole(UserRole.USER)
                .userGender(UserGender.UNSPECIFIED)
                .build();

        user.agreePrivacy();

        assertNotNull(user.getPrivacyAgreedAt());
        assertTrue(user.needsSocialSignUp());
    }

    @Test
    void shouldNotRequireSocialSignUpAfterConsentAndRequiredProfileInfoAreSaved() {
        Users user = Users.builder()
                .name("completed user")
                .email("completed@example.com")
                .nickname("completed-user")
                .userRole(UserRole.USER)
                .userGender(UserGender.UNSPECIFIED)
                .build();

        user.agreePrivacy();
        LocalDateTime agreedAt = user.getPrivacyAgreedAt();
        user.completeSocialSignUp(java.time.LocalDate.of(1999, 1, 1), UserGender.FEMALE);

        assertFalse(user.needsSocialSignUp());
        assertNotNull(user.getBirthDate());
        assertEquals(agreedAt, user.getPrivacyAgreedAt());
    }
}
