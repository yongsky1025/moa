package com.soldesk.moa.repository.board;

import java.time.LocalDate;
import java.util.stream.IntStream;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.soldesk.moa.board.repository.BoardRepository;
import com.soldesk.moa.board.repository.PostRepository;
import com.soldesk.moa.circle.entity.Circle;
import com.soldesk.moa.circle.entity.CircleCategory;
import com.soldesk.moa.circle.entity.constant.CircleStatus;
import com.soldesk.moa.circle.repository.CircleRepository;
import com.soldesk.moa.users.entity.Users;
import com.soldesk.moa.users.entity.constant.UserGender;
import com.soldesk.moa.users.entity.constant.UserRole;
import com.soldesk.moa.users.repository.UsersRepository;

@Disabled
@SpringBootTest
public class AnotherRepoTest {

    @Autowired
    private UsersRepository usersRepository;

    @Autowired
    private CircleRepository circleRepository;

    @Test
    public void testInsertUser() {
        IntStream.rangeClosed(1, 20).forEach(i -> {
            Users users = Users.builder()
                    .name("name" + i)
                    .email("user" + i + "@gmail.com")
                    .password("1111")
                    .nickname("user" + i)
                    .address("address" + i)
                    .birthDate(LocalDate.of(1999, 10, i))
                    .phoneNumber("010-0000-0000")
                    .userRole(UserRole.USER)
                    .userGender(UserGender.MALE)
                    .build();
            usersRepository.save(users);

        });
    }

}
