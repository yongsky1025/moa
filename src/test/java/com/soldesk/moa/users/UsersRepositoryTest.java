package com.soldesk.moa.users;

import java.time.LocalDate;
import java.util.stream.IntStream;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.soldesk.moa.users.entity.Users;
import com.soldesk.moa.users.entity.constant.UserGender;
import com.soldesk.moa.users.entity.constant.UserRole;
import com.soldesk.moa.users.repository.UsersRepository;

@Disabled
@SpringBootTest
public class UsersRepositoryTest {

    @Autowired
    private UsersRepository usersRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    public void usersInsertTest() {
        IntStream.rangeClosed(1, 10).forEach(i -> {
            Users users = Users.builder()
                    .email("user" + i + "@gmail.com")
                    .name("user " + i)
                    .userGender(UserGender.MALE)
                    .nickname("nickname" + i)
                    .password(passwordEncoder.encode("1111"))
                    .address("adress " + i)
                    .birthDate(LocalDate.of(1999, 11, 23))
                    .phoneNumber("010-1234-5678")
                    .userRole(UserRole.USER)
                    .build();
            usersRepository.save(users);
        });
    }
}
