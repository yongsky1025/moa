package com.soldesk.moa.admin;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.IntStream;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.Commit;
import org.springframework.transaction.annotation.Transactional;

import com.soldesk.moa.admin.repository.AdminCMRepository;
import com.soldesk.moa.admin.repository.AdminCircleRepository;
import com.soldesk.moa.admin.repository.AdminRepository;
import com.soldesk.moa.circle.entity.Circle;
import com.soldesk.moa.circle.entity.CircleCategory;
import com.soldesk.moa.circle.entity.CircleMember;
import com.soldesk.moa.circle.entity.constant.CircleStatus;
import com.soldesk.moa.circle.repository.CircleCategoryRepository;
import com.soldesk.moa.users.entity.Users;
import com.soldesk.moa.users.entity.constant.UserGender;
import com.soldesk.moa.users.entity.constant.UserRole;

@SpringBootTest
@Transactional
public class AdminRepositoryTest {

    @Autowired
    private AdminRepository adminRepository;
    @Autowired
    private AdminCMRepository adminCMRepository;
    @Autowired
    private AdminCircleRepository adminCircleRepository;
    @Autowired
    private CircleCategoryRepository circleCategoryRepository;

    // create - 관리자 생성
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
                    .userGender(UserGender.FEMALE)
                    .build();

            adminRepository.save(users);
        });
    }

    // create - 일반 유저 더미데이터 생성
    @Commit
    @Test
    public void createMember() {
        IntStream.rangeClosed(1, 800).forEach(i -> {
            long random = Math.round(Math.random());
            UserGender gender = random == 0 ? UserGender.MALE : UserGender.FEMALE;
            Users users = Users.builder()
                    .name("member-" + i)
                    .email("member" + i + "naver.com")
                    .password("1111")
                    .nickname("hehehehe" + i)
                    .address("Seoul")
                    .userRole(UserRole.USER)
                    .userGender(gender)
                    .build();

            adminRepository.save(users);
        });
    }

    // create - 모임카테고리 생성
    @Test
    @Commit
    public void createCircleCategory() {
        IntStream.rangeClosed(1, 5).forEach(i -> {
            CircleCategory category = CircleCategory.builder()
                    .categoryName("category-00" + i)
                    .build();

            circleCategoryRepository.save(category);

        });

    }

    // create - 모임 생성
    @Test
    @Commit
    public void createCircle() {
        IntStream.rangeClosed(1, 20).forEach(i -> {
            int idx = (int) (Math.random() * 5 + 1);
            CircleCategory category = CircleCategory.builder().categoryName("category-00" + idx).build();
            Circle circle = Circle.builder()
                    .name("circle" + i)
                    .description("hello, this is moa circle")
                    .status(CircleStatus.OPEN)
                    .maxMember(20)
                    .currentMember(0)
                    .category(category)
                    .build();

            adminCircleRepository.save(circle);

        });
    }

    // create - 유저 중 랜덤으로 모임에 가입
    @Test
    @Commit
    public void joinCircle() {

        int circleIdx = (int) (Math.random() * 20 + 1);

        int idx1 = (int) (Math.random() * 800 + 1);
        IntStream.rangeClosed(1, idx1).forEach(i -> {
            int idx2 = (int) (Math.random() * 800 + 1);
            CircleMember circleMember = CircleMember.builder()

                    .build();

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

    // 성비 구하기 위한 전체 유저 수 / 남자 유저 수 조회
    @Test
    public void getCountAllAndMale() {

        Object[] result = adminRepository.getCountAllAndMale();
        Object[] row = (Object[]) result[0];

        System.out.println(row[0]);
        System.out.println(row[1]);
    }

    // ?년?월 가입자 조회
    @Test
    public void findByCreateDate() {
        // 이번달 가입자 조회
        int thisYear = LocalDateTime.now().getYear();
        int thisMonth = LocalDateTime.now().getMonthValue();
        List<Users> result = adminRepository.getListByCreateMonth(thisYear, thisMonth);
        result.forEach(System.out::println);
    }

    // 전체 유저 수 조회 & 모임 가입 유저 수 조회
    @Test
    public void getAllUser() {
        long countUsers = adminRepository.findAll().size();
        System.out.println(countUsers);

        long countCMs = adminCMRepository.findAll().size();
        System.out.println(countCMs);
    }
}
