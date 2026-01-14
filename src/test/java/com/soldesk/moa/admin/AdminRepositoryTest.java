package com.soldesk.moa.admin;

import java.util.stream.IntStream;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.Commit;
import org.springframework.transaction.annotation.Transactional;

import com.soldesk.moa.admin.repository.AdminRepository;
import com.soldesk.moa.users.entity.Users;
import com.soldesk.moa.users.entity.constant.UserRole;

@SpringBootTest
@Transactional
public class AdminRepositoryTest {

    @Autowired
    private AdminRepository adminRepository;

    // create
    @Commit
    @Test
    public void createAdmin() {

        IntStream.rangeClosed(1, 5).forEach(i -> {
            Users users = Users.builder()
                    .name("admin-" + i)
                    .email("test" + i + "@google.com")
                    .password("1111")
                    .nickname("nicknick" + i)
                    .address("Seoul")
                    .userRole(UserRole.ADMIN)
                    .build();

            adminRepository.save(users);
        });
    }

    // read
    @Test
    public void readAdminInfo() {
        System.out.println(adminRepository.findById(2L));
    }

    // update
    @Commit
    @Test
    public void updateAdminInfo() {

        // nickname 수정
        Users user = adminRepository.findById(3L).orElseThrow();
        user.changeNickname("update nickname!");

        // address 수정
        user.changeAddress("Busan");

        // pwd 수정
        user.changePassword("2222");
    }

    @Commit
    @Test
    public void deleteAdmin() {
        adminRepository.deleteById(4L);
    }
}
