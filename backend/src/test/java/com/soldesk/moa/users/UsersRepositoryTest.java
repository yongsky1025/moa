package com.soldesk.moa.users;

import java.time.LocalDate;
import java.util.stream.IntStream;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.annotation.Commit;

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

    @Disabled
    @Test
    public void usersInsertTest() {
        IntStream.rangeClosed(1, 10).forEach(i -> {
            boolean isAdmin = (i == 1);
            String email = isAdmin ? "admin@gmail.com" : "user" + i + "@gmail.com";
            if (usersRepository.existsByEmail(email)) {
                return;
            }

            Users user = Users.builder()
                    .email(email)
                    .name(isAdmin ? "admin" : "user " + i)
                    .userGender(UserGender.MALE)
                    .nickname(isAdmin ? "admin" : "nickname" + i)
                    .password(passwordEncoder.encode("1111"))
                    .birthDate(LocalDate.of(1999, 11, 23))
                    .userRole(isAdmin ? UserRole.ADMIN : UserRole.USER)
                    .build();
            usersRepository.save(user);
        });
    }

    // create - 관리자 생성
    @Commit
    @Test
    public void createAdmin() {

        IntStream.rangeClosed(1, 5).forEach(i -> {
            Users users = Users.builder()
                    .name("admin-" + i)
                    .email("test" + i + "@google.com")
                    .password(passwordEncoder.encode("1111"))
                    .nickname("nicknick" + i)
                    .userRole(UserRole.ADMIN)
                    .userGender(UserGender.FEMALE)
                    .birthDate(LocalDate.now().minusYears(i + 20))
                    .build();

            usersRepository.save(users);
        });
    }

    // create - 일반 유저 더미데이터 생성
    @Commit
    @Test
    public void createUsers() {
        IntStream.rangeClosed(1, 925).forEach(i -> {
            LocalDate birth = LocalDate.of((int) (Math.random() * 40 + 1970), (int) (Math.random() * 12 + 1),
                    (int) (Math.random() * 28 + 1));
            long random = Math.round(Math.random());
            UserGender gender = random == 0 ? UserGender.MALE : UserGender.FEMALE;
            Users users = Users.builder()
                    .name("member-" + i)
                    .email("member" + i + "@google.com")
                    .password(passwordEncoder.encode("1111"))
                    .nickname("member" + i)
                    .birthDate(birth)
                    .userRole(UserRole.USER)
                    .userGender(gender)
                    .build();

            usersRepository.save(users);
        });
    }
}
