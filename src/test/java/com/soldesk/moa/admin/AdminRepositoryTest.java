package com.soldesk.moa.admin;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.IntStream;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.test.annotation.Commit;
import org.springframework.transaction.annotation.Transactional;

import com.soldesk.moa.admin.repository.AdminBoardRepository;
import com.soldesk.moa.admin.repository.AdminPostRepository;
import com.soldesk.moa.admin.repository.AdminCircleMemberRepository;
import com.soldesk.moa.admin.repository.AdminCircleRepository;
import com.soldesk.moa.admin.repository.AdminReplyRepository;
import com.soldesk.moa.admin.repository.AdminScheduleMemberRepository;
import com.soldesk.moa.admin.repository.AdminScheduleRepository;
import com.soldesk.moa.admin.repository.AdminUsersRepository;
import com.soldesk.moa.admin.temporary.Reply;
import com.soldesk.moa.board.entity.Board;
import com.soldesk.moa.board.entity.Post;
import com.soldesk.moa.board.entity.constant.BoardType;
import com.soldesk.moa.circle.entity.Circle;
import com.soldesk.moa.circle.entity.CircleCategory;
import com.soldesk.moa.circle.entity.CircleMember;
import com.soldesk.moa.circle.entity.constant.CircleMemberStatus;
import com.soldesk.moa.circle.entity.constant.CircleRole;
import com.soldesk.moa.circle.entity.constant.CircleStatus;
import com.soldesk.moa.circle.repository.CircleCategoryRepository;
import com.soldesk.moa.schedule.entity.Schedule;
import com.soldesk.moa.schedule.entity.ScheduleMember;
import com.soldesk.moa.schedule.entity.constant.ScheduleMemberStatus;
import com.soldesk.moa.users.entity.Users;
import com.soldesk.moa.users.entity.constant.UserGender;
import com.soldesk.moa.users.entity.constant.UserRole;
import com.soldesk.moa.users.entity.constant.UserStatus;

@SpringBootTest
@Transactional
// @Disabled
public class AdminRepositoryTest {

    @Autowired
    private AdminUsersRepository adminUsersRepository;
    @Autowired
    private AdminCircleMemberRepository adminCircleMemberRepository;
    @Autowired
    private AdminCircleRepository adminCircleRepository;
    @Autowired
    private CircleCategoryRepository circleCategoryRepository;
    @Autowired
    private AdminPostRepository adminBoardRepository;
    @Autowired
    private AdminBoardRepository adminBoardCategoryRepository;
    @Autowired
    private AdminReplyRepository adminReplyRepository;
    @Autowired
    private AdminScheduleRepository adminScheduleRepository;
    @Autowired
    private AdminScheduleMemberRepository adminScheduleMemberRepository;

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
                    .birthDate(LocalDate.now().minusYears(i + 20))
                    .phone("010-1111-1111")
                    .build();

            adminUsersRepository.save(users);
        });
    }

    // create - 일반 유저 더미데이터 생성
    @Commit
    @Test
    public void createMember() {
        IntStream.rangeClosed(1, 925).forEach(i -> {
            LocalDate birth = LocalDate.of((int) (Math.random() * 40 + 1970), (int) (Math.random() * 12 + 1),
                    (int) (Math.random() * 28 + 1));
            long random = Math.round(Math.random());
            UserGender gender = random == 0 ? UserGender.MALE : UserGender.FEMALE;
            Users users = Users.builder()
                    .name("member-" + i)
                    .email("member" + i + "naver.com")
                    .password("1111")
                    .nickname("hehehehe" + i)
                    .address("Seoul")
                    .birthDate(birth)
                    .phone("010-1111-1111")
                    .userRole(UserRole.USER)
                    .userGender(gender)
                    .build();

            adminUsersRepository.save(users);
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
            long idx = (long) (Math.random() * 5 + 1);
            CircleCategory category = circleCategoryRepository.findById(idx).get();
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

        IntStream.rangeClosed(1, 815).forEach(i -> {
            double registerIdx = Math.random();
            long circleIdx = (long) (Math.random() * 20 + 1);
            Circle circle = adminCircleRepository.findById(circleIdx).get();

            if (registerIdx < 0.5) {
                if (circle.getCurrentMember() < circle.getMaxMember()) {
                    long userIdx = (long) (Math.random() * 815 + 1);
                    Users user = adminUsersRepository.findById(userIdx).get();

                    CircleMember circleMember = CircleMember.builder()
                            .user(user)
                            .circle(circle)
                            .role(CircleRole.MEMBER)
                            .status(CircleMemberStatus.ACTIVE)
                            .build();

                    adminCircleMemberRepository.save(circleMember);
                    circle.increaseMember();

                } else
                    return;
            }

        });
    }

    // board category 생성
    @Test
    @Commit
    public void createBoardCategory() {
        IntStream.rangeClosed(1, 5).forEach(i -> {
            Board board = Board.builder()
                    .boardType(BoardType.FREE)
                    .name("게시판-" + i)
                    .build();

            adminBoardCategoryRepository.save(board);
        });
    }

    // board 생성(post)
    @Test
    @Commit
    public void createBoard() {
        IntStream.rangeClosed(1, 200).forEach(i -> {
            long userIdx = (long) (Math.random() * 815 + 1);
            Users user = adminUsersRepository.findById(userIdx).get();

            // long circleIdx = (long) (Math.random() * 20 + 1);
            // Circle circle = adminCircleRepository.findById(circleIdx).get();

            long bcategoryIdx = (long) (Math.random() * 5 + 1);
            Board board = adminBoardCategoryRepository.findById(bcategoryIdx).get();

            Post post = Post.builder()
                    .title("titleew4 - " + i)
                    .content("heeeee...")
                    .userId(user)
                    .boardId(board)
                    .build();

            adminBoardRepository.save(post);

        });
    }

    // reply 생성
    @Test
    @Commit
    public void createReply() {
        IntStream.rangeClosed(1, 400).forEach(i -> {
            long userIdx = (long) (Math.random() * 815 + 1);
            Users user = adminUsersRepository.findById(userIdx).get();

            long boardIdx = (long) (Math.random() * 30 + 1);
            Post post = adminBoardRepository.findById(boardIdx).get();

            Reply reply = Reply.builder()
                    .content("it was so good!")
                    .user(user)
                    .post(post)
                    .build();

            adminReplyRepository.save(reply);
        });
    }

    // 일정 생성
    @Test
    @Commit
    public void createSchedule() {
        IntStream.rangeClosed(1, 200).forEach(i -> {

            List<Circle> circles = adminCircleRepository.findAll();
            List<CircleMember> circleMembers = adminCircleMemberRepository.findAll();
            Circle circle = circles.get((int) (Math.random() * circles.size()));
            CircleMember circleMember = circleMembers.get((int) (Math.random() * circleMembers.size()));

            LocalDateTime starAt = LocalDateTime.of(2026, 1, 1, 0, 0, 0);
            LocalDateTime endAt = LocalDateTime.of(2026, 2, 2, 0, 00, 0);

            if (circle.getCircleId() != circleMember.getCircle().getCircleId()) {
                return;
            }

            Schedule schedule = Schedule.builder()
                    .title("일정634 " + i)
                    .description("deefaiefeji" + i)
                    .maxMember(10)
                    .circle(circle)
                    .creator(circleMember)
                    .startAt(starAt)
                    .endAt(endAt)
                    .build();
            adminScheduleRepository.save(schedule);

        });
    }

    // 일정에 참가하는 멤버 생성
    @Test
    @Commit
    public void createScheduleMember() {
        IntStream.rangeClosed(1, 241).forEach(i -> {
            List<CircleMember> circleMembers = adminCircleMemberRepository.findAll();
            CircleMember circleMember = circleMembers.get((int) (Math.random() * circleMembers.size()));
            List<Schedule> schedules = adminScheduleRepository.findAll();
            Schedule schedule = schedules.get((int) (Math.random() * schedules.size()));

            if (schedule.getCurrentMember() < schedule.getMaxMember()) {
                ScheduleMember scheduleMember = ScheduleMember.builder()
                        .schedule(schedule)
                        .circleMember(circleMember)
                        .status(ScheduleMemberStatus.JOIN)
                        .build();
                adminScheduleMemberRepository.save(scheduleMember);
                schedule.setCurrentMember(schedule.getCurrentMember() + 1);
            }

        });
    }

    // circle_member status column 추가
    @Test
    @Commit
    public void addCMStatus() {
        int count = adminCircleMemberRepository.findAll().size();
        IntStream.rangeClosed(1, count).forEach(i -> {
            CircleMember cm = adminCircleMemberRepository.findById((long) i).orElseThrow();
            double random = Math.random();
            if (random < 0.85) {
                cm.changeStatus(CircleMemberStatus.ACTIVE);
            } else {
                cm.changeStatus(CircleMemberStatus.LEFT);
            }
        });
    }

    // read
    @Test
    public void readAdminInfo() {
        System.out.println(adminUsersRepository.findById(2L));
    }

    // update
    @Commit
    @Test
    public void updateAdminInfo() {

        // nickname 수정
        Users user = adminUsersRepository.findById(3L).orElseThrow();
        user.changeNickname("update nickname!");

        // address 수정
        user.changeAddress("Busan");

        // pwd 수정
        user.changePassword("2222");
    }

    // users entity column 추가 후 birthDate, age, phone 삽입(수정)
    @Test
    @Commit
    public void updateUserInfo() {
        adminUsersRepository.findAll().forEach(user -> {
            // int randomYear = (int) (Math.random() * 40 + 1970);
            // int randomMonth = (int) (Math.random() * 12 + 1);
            // int randomDate = (int) (Math.random() * 28 + 1);

            // user.setBirthDate(LocalDate.of(randomYear, randomMonth, randomDate));
            // user.setPhone("010-1111-1111");
            user.addAge();
            System.out.println(user.getBirthDate());
            System.out.println(user.getAge());
        });
    }

    // findUsersWithoutCircle test
    @Test
    public void findUsersWithoutCircle() {
        adminUsersRepository.findUsersWithoutCircle().forEach(System.out::println);
    }

    // 탈퇴자(soft delete) 더미데이터 생성(기존 회원 정보 수정)
    @Commit
    @Test
    public void changeUserStatus() {
        List<Users> targetUsers = adminUsersRepository.findUsersWithoutCircle();

        targetUsers.forEach(user -> {
            if (user.getUserRole() != UserRole.ADMIN) {
                if (Math.random() < 0.15) {
                    user.withdraw();
                }
            }
        });

    }

    // 기간별 가입자 조회를 위한 createDate 임의 수정
    @Test
    @Commit
    public void setCreateDate() {
        List<Users> users = adminUsersRepository.findAll();
        LocalDateTime end = LocalDateTime.now();
        LocalDateTime start = end.minusYears(2);

        users.forEach(user -> {

            // toEpochSecond => 시간을 초 단위 숫자(long)으로 변환, ZoneOffset
            long startSeconds = start.toEpochSecond(ZoneOffset.UTC);
            long endSeconds = end.toEpochSecond(ZoneOffset.UTC);
            long randomSecond = ThreadLocalRandom.current().nextLong(startSeconds, endSeconds);
            LocalDateTime joinDateTime = LocalDateTime.ofEpochSecond(randomSecond, 0, ZoneOffset.UTC);
            user.setCreateDate(joinDateTime);
        });
    }

    @Commit
    @Test
    public void deleteAdmin() {
        adminUsersRepository.deleteById(4L);
    }

    // 성비 구하기 위한 전체 유저 수 / 남자 유저 수 조회 (현재 활동 중)
    @Test
    public void getCountAllAndMale() {

        Object[] result = adminUsersRepository.getCountAllAndMale();
        Object[] row = (Object[]) result[0];

        System.out.println("all : " + row[0]);
        System.out.println("male : " + row[1]);
    }

    // 전체 유저 수 조회 & 모임 가입 유저 수 조회
    @Test
    public void getAllUser() {
        // long countUsers = adminUsersRepository.findAll().size()
        // - adminUsersRepository.findByUserStatus(UserStatus.WITHDRAWN).size();
        Object[] result = adminUsersRepository.getCountAllAndMale();
        Object[] row = (Object[]) result[0];
        System.out.println(row[0]);

        // long countCMs = adminCircleMemberRepository.findAll().size()
        // - adminUsersRepository.findByUserStatus(UserStatus.WITHDRAWN).size();
        long countCMs = adminCircleMemberRepository.findAll().size();
        System.out.println(countCMs);
    }

    // ?년?월 가입자 조회
    @Test
    public void findUsersByCreateDate() {
        // 이번달 가입자 조회
        int thisYear = LocalDateTime.now().getYear();
        int thisMonth = LocalDateTime.now().getMonthValue();
        List<Users> result = adminUsersRepository.getListByCreateMonth(thisYear,
                thisMonth);
        result.forEach(System.out::println);
    }

    // 가입자 수 조회(기간 검색)
    @Test
    public void getSignUpCount() {
        LocalDateTime start = LocalDateTime.now().minusMonths(1L);
        LocalDateTime end = LocalDateTime.now();

        long result = adminUsersRepository.getSignUpCount(start, end);
        System.out.println(result);
    }

    // 탈퇴자 수 조회(임의의 기간)
    @Test
    public void getWithdrawnUsers() {
        // 최근 3개월
        LocalDateTime start = LocalDateTime.of(2025, 11, 1, 0, 0, 0);
        LocalDateTime end = LocalDateTime.now();
        Long result = adminUsersRepository.getWithdrawnUsersCount(start, end);
        System.out.println(result);
    }

    // 탈퇴자의 정보 조회(기간 검색)
    @Test
    public void getWithdrawnUsersInfo() {
        // 최근 3개월
        LocalDateTime start = LocalDateTime.of(2025, 11, 1, 0, 0, 0);
        LocalDateTime end = LocalDateTime.now();
        List<Users> result = adminUsersRepository.getWithdrawnUsersInfo(start, end);
        // 여기서 탈퇴자 수도 조회 가능하다
        System.out.println(result.size());
        result.forEach(System.out::println);

    }

    /// 월별 탈퇴자 수 조회
    @Test
    public void countWithdrawnGroupByMonth() {
        List<Object[]> result = adminUsersRepository.countWithdrawnGroupByMonth();
        result.forEach(obj -> {
            System.out.println("year : " + obj[0]);
            System.out.println("month : " + obj[1]);
            System.out.println("count : " + obj[2]);
        });
    }

    // 총 모임 개수 조회
    @Test
    public void getCircle() {
        System.out.println(adminCircleRepository.findAll().size());
    }

    // ?년?월 생성된 모임 조회
    @Test
    public void findCirclesByCreateDate() {
        // 2025-09
        List<Circle> result = adminCircleRepository.getListByCreateMonth(2025, 9);
        result.forEach(System.out::println);
    }

    // 카테고리 별 모임 수 조회
    @Test
    public void getCircleByCategory() {
        List<Object[]> result = adminCircleRepository.getCircleByCategory();
        result.forEach(obj -> {
            System.out.println("category_name : " + obj[0] + ", count : " + obj[1]);
        });
    }

    // 특정 유저의 게시글 이력 조회
    @Test
    public void searchBoardListByUserId() {
        Pageable pageable = PageRequest.of(0, 20);

        List<Users> users = adminUsersRepository.findAll();
        Users user = users.get((int) (Math.random() * users.size()));

        Page<Object[]> result = adminBoardRepository.searchBoardListByUserId(771L,
                pageable);
        result.forEach(obj -> {
            System.out.println(Arrays.toString(obj));
            // [Board(boardId=1, title=title - 1, content=heeeee...), 게시판-3, member-614,15]
        });
    }

    // 특정 유저가 가입되어 있는 모임 정보 조회
    @Test
    public void getJoinCircleByUserId() {
        Pageable pageable = PageRequest.of(0, 20);

        Page<Object[]> result = adminCircleRepository.getJoinCircleByUserId(162L,
                pageable);
        result.forEach(obj -> {
            System.out.println(Arrays.toString(obj));
            // [Circle(circleId=9, name=circle9, description=hello, this is moa circle,
            // status=OPEN, maxMember=20, currentMember=19), 363, category-004]
        });
    }

    // 월별 가입자 수 조회
    @Test
    public void getCountCreateUserByDate() {
        adminUsersRepository.getCountCreateUserByDate().forEach(obj -> {
            System.out.println("year " + obj[0] + " month " + obj[1] + " count : " +
                    obj[2]);
            // year 2026 month 1 count : 814
            // year 2025 month 10 count : 1
        });
    }

    // 연령대별 유저 수 & 성비 조회(탈퇴자 x)
    @Test
    public void getAgeGroup() {
        adminUsersRepository.getAgeGroup().forEach(obj -> {
            System.out.println(obj[0] + "대 : 유저 수 " + obj[1] + " 남:" + obj[2] + " 여:" +
                    obj[3]);
        });
    }

    // 모임(하나라도)에 가입되어있는 유저 수
    @Test
    public void getCountCircleMember() {
        System.out.println(adminCircleMemberRepository.getCountCircleMember());
    }

    // 전체 유저 정보 조회(검색)
    @Test
    public void getUsersInfo() {
        Pageable pageable = PageRequest.of(0, 5);
        // 나이로 조회
        Page<Users> result = adminUsersRepository.getUsersInfo(pageable, "a", "30");
        result.forEach(System.out::println);
    }
}
