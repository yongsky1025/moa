package com.soldesk.moa.repository.board;

import java.util.stream.IntStream;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import com.soldesk.moa.board.entity.Post;
import com.soldesk.moa.board.entity.constant.BoardRole;
import com.soldesk.moa.board.repository.BoardRepository;
import com.soldesk.moa.users.entity.Users;
import com.soldesk.moa.users.entity.constant.UserRole;
import com.soldesk.moa.users.repository.UsersRepository;

@Disabled
@SpringBootTest
public class BoardRepositoryTest {

    @Autowired
    private UsersRepository usersRepository;

    @Autowired
    private BoardRepository boardRepository;

    @Test
    public void testInsertUser() {
        IntStream.rangeClosed(1, 20).forEach(i -> {
            Users users = Users.builder()
                    .name("name" + i)
                    .email("user" + i + "@gmail.com")
                    .nickname("user" + i)
                    .address("address" + i)
                    .password("1111")
                    .userRole(UserRole.USER)
                    .build();
            usersRepository.save(users);

        });
    }
}
