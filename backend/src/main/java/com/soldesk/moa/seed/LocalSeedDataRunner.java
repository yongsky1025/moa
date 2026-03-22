package com.soldesk.moa.seed;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.soldesk.moa.auth.repository.RefreshTokenRepository;
import com.soldesk.moa.board.entity.Board;
import com.soldesk.moa.board.entity.constant.BoardType;
import com.soldesk.moa.board.repository.BoardRepository;
import com.soldesk.moa.chat.repository.ChatMessageRepository;
import com.soldesk.moa.chat.repository.ChatRoomMemberRepository;
import com.soldesk.moa.chat.repository.ChatRoomRepository;
import com.soldesk.moa.common.repository.ImageRepository;
import com.soldesk.moa.circle.entity.Circle;
import com.soldesk.moa.circle.entity.CircleCategory;
import com.soldesk.moa.circle.entity.CircleEnergyProfile;
import com.soldesk.moa.circle.entity.CircleMember;
import com.soldesk.moa.circle.entity.constant.CircleMemberStatus;
import com.soldesk.moa.circle.entity.constant.CircleRole;
import com.soldesk.moa.circle.entity.constant.CircleStatus;
import com.soldesk.moa.circle.repository.CircleCategoryRepository;
import com.soldesk.moa.circle.repository.CircleEnergyProfileRepository;
import com.soldesk.moa.circle.repository.CircleMemberRepository;
import com.soldesk.moa.circle.repository.CircleRepository;
import com.soldesk.moa.notification.repository.NotificationRepository;
import com.soldesk.moa.post.entity.Post;
import com.soldesk.moa.post.repository.PostRepository;
import com.soldesk.moa.reply.entity.Reply;
import com.soldesk.moa.reply.repository.ReplyRepository;
import com.soldesk.moa.schedule.repository.ScheduleMemberRepository;
import com.soldesk.moa.schedule.repository.ScheduleRepository;
import com.soldesk.moa.users.entity.Users;
import com.soldesk.moa.users.entity.UsersEnergyProfile;
import com.soldesk.moa.users.entity.constant.AuthProvider;
import com.soldesk.moa.users.entity.constant.EnergyType;
import com.soldesk.moa.users.entity.constant.UserGender;
import com.soldesk.moa.users.entity.constant.UserRole;
import com.soldesk.moa.users.entity.constant.UserStatus;
import com.soldesk.moa.users.repository.UsersEnergyProfileRepository;
import com.soldesk.moa.users.repository.UsersRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Log4j2
@Component
@Profile("local")
@RequiredArgsConstructor
public class LocalSeedDataRunner implements CommandLineRunner {

    private static final int USER_COUNT = 10;
    private static final int CIRCLE_COUNT = 5;
    private static final int CIRCLE_BOARD_PER_CIRCLE = 5;
    private static final int POSTS_PER_BOARD = 10;

    @Value("${app.seed.enabled:true}")
    private boolean seedEnabled;

    @Value("${app.seed.reset:true}")
    private boolean resetBeforeSeed;

    @Value("${app.seed.random-seed:20260321}")
    private long randomSeed;

    private final PasswordEncoder passwordEncoder;
    private final UsersRepository usersRepository;
    private final UsersEnergyProfileRepository usersEnergyProfileRepository;
    private final CircleCategoryRepository circleCategoryRepository;
    private final CircleRepository circleRepository;
    private final CircleEnergyProfileRepository circleEnergyProfileRepository;
    private final CircleMemberRepository circleMemberRepository;
    private final BoardRepository boardRepository;
    private final PostRepository postRepository;
    private final ReplyRepository replyRepository;
    private final ScheduleMemberRepository scheduleMemberRepository;
    private final ScheduleRepository scheduleRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final NotificationRepository notificationRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final ChatRoomMemberRepository chatRoomMemberRepository;
    private final ChatRoomRepository chatRoomRepository;
    private final ImageRepository imageRepository;

    @Override
    @Transactional
    public void run(String... args) {
        if (!seedEnabled) {
            log.info("[SEED] app.seed.enabled=false, 시드 생성을 건너뜁니다.");
            return;
        }

        Random random = new Random(randomSeed);
        log.info("[SEED] local 시드 시작 (reset={}, randomSeed={})", resetBeforeSeed, randomSeed);

        if (resetBeforeSeed) {
            resetData();
        }

        List<Users> allUsers = createUsers(random);
        createUsersEnergyProfiles(allUsers, random);

        List<CircleCategory> categories = createCategories();
        CircleSeedContext circleContext = createCirclesWithMembersAndProfiles(allUsers, categories, random);
        List<Board> boards = createBoards(circleContext.circles());
        List<Post> posts = createPosts(boards, allUsers, circleContext.circleUsers(), random);
        createReplies(posts, allUsers, circleContext.circleUsers(), random);

        logSummary();
        log.info("[SEED] local 시드 완료");
    }

    private void resetData() {
        chatMessageRepository.deleteAllInBatch();
        chatRoomMemberRepository.deleteAllInBatch();
        chatRoomRepository.deleteAllInBatch();
        notificationRepository.deleteAllInBatch();
        refreshTokenRepository.deleteAllInBatch();
        scheduleMemberRepository.deleteAllInBatch();
        scheduleRepository.deleteAllInBatch();
        replyRepository.unlinkParentReferences();
        replyRepository.deleteAllInBatch();
        circleRepository.clearAllCoverImages();
        usersRepository.clearAllProfileImages();
        imageRepository.deleteAllInBatch();
        postRepository.deleteAllInBatch();
        boardRepository.deleteAllInBatch();
        circleMemberRepository.deleteAllInBatch();
        circleEnergyProfileRepository.deleteAllInBatch();
        circleRepository.deleteAllInBatch();
        usersEnergyProfileRepository.deleteAllInBatch();
        usersRepository.deleteAllInBatch();
        circleCategoryRepository.deleteAllInBatch();
    }

    private List<Users> createUsers(Random random) {
        List<Users> users = new ArrayList<>();
        users.add(Users.builder()
                .name("관리자")
                .email("admin@moa.local")
                .password(passwordEncoder.encode("Admin!1234"))
                .nickname("admin")
                .birthDate(LocalDate.of(1990, 1, 1))
                .userRole(UserRole.ADMIN)
                .userGender(UserGender.UNSPECIFIED)
                .provider(AuthProvider.LOCAL)
                .userStatus(UserStatus.ACTIVE)
                .privacyAgreedAt(LocalDateTime.now())
                .onboardingCompletedAt(LocalDateTime.now())
                .statusMessage("관리자 계정")
                .bio("테스트용 관리자 계정")
                .build());

        for (int i = 1; i <= USER_COUNT; i++) {
            UserGender gender = switch (i % 3) {
                case 0 -> UserGender.UNSPECIFIED;
                case 1 -> UserGender.MALE;
                default -> UserGender.FEMALE;
            };
            int birthYear = 1988 + random.nextInt(15);
            int birthMonth = 1 + random.nextInt(12);
            int birthDay = 1 + random.nextInt(28);

            users.add(Users.builder()
                    .name("유저" + String.format("%02d", i))
                    .email("user" + String.format("%02d", i) + "@moa.local")
                    .password(passwordEncoder.encode("User!1234"))
                    .nickname("user" + String.format("%02d", i))
                    .birthDate(LocalDate.of(birthYear, birthMonth, birthDay))
                    .userRole(UserRole.USER)
                    .userGender(gender)
                    .provider(AuthProvider.LOCAL)
                    .userStatus(UserStatus.ACTIVE)
                    .privacyAgreedAt(LocalDateTime.now().minusDays(1 + random.nextInt(180)))
                    .onboardingCompletedAt(LocalDateTime.now().minusDays(random.nextInt(90)))
                    .statusMessage("안녕하세요! 테스트 유저입니다.")
                    .bio("테스트용 사용자 프로필")
                    .build());
        }

        return usersRepository.saveAll(users);
    }

    private void createUsersEnergyProfiles(List<Users> users, Random random) {
        List<UsersEnergyProfile> profiles = new ArrayList<>();
        for (Users user : users) {
            int socialLoad = randomScore(random);
            int interactionMode = randomScore(random);
            int structureLevel = randomScore(random);
            int activityIntensity = randomScore(random);
            int commitmentLevel = randomScore(random);

            profiles.add(UsersEnergyProfile.builder()
                    .user(user)
                    .socialLoad(socialLoad)
                    .interactionMode(interactionMode)
                    .structureLevel(structureLevel)
                    .activityIntensity(activityIntensity)
                    .commitmentLevel(commitmentLevel)
                    .energyType(EnergyType.classify(socialLoad, interactionMode, activityIntensity))
                    .build());
        }
        usersEnergyProfileRepository.saveAll(profiles);
    }

    private List<CircleCategory> createCategories() {
        List<String> names = List.of("운동", "게임", "독서", "음악", "언어교류");
        List<CircleCategory> categories = names.stream()
                .map(name -> CircleCategory.builder().categoryName(name).build())
                .toList();
        return circleCategoryRepository.saveAll(categories);
    }

    private CircleSeedContext createCirclesWithMembersAndProfiles(
            List<Users> users,
            List<CircleCategory> categories,
            Random random) {

        List<Users> normalUsers = users.stream()
                .filter(u -> u.getUserRole() == UserRole.USER)
                .toList();

        List<Circle> circles = new ArrayList<>();
        List<CircleEnergyProfile> profiles = new ArrayList<>();
        List<CircleMember> members = new ArrayList<>();
        Map<Long, List<Users>> circleUsers = new LinkedHashMap<>();

        for (int i = 0; i < CIRCLE_COUNT; i++) {
            int memberCount = 6 + random.nextInt(7); // 6~12
            boolean full = i % 5 == 0;
            int maxMember = full ? memberCount : memberCount + 3 + random.nextInt(6);

            Circle circle = Circle.builder()
                    .name("테스트 써클 " + String.format("%02d", i + 1))
                    .description("테스트 데이터를 위한 써클 설명 " + (i + 1))
                    .status(full ? CircleStatus.FULL : CircleStatus.OPEN)
                    .maxMember(maxMember)
                    .currentMember(memberCount)
                    .category(categories.get(i % categories.size()))
                    .build();

            Circle savedCircle = circleRepository.save(circle);
            circles.add(savedCircle);

            profiles.add(CircleEnergyProfile.builder()
                    .circle(savedCircle)
                    .socialLoad(randomScore(random))
                    .interactionMode(randomScore(random))
                    .structureLevel(randomScore(random))
                    .activityIntensity(randomScore(random))
                    .commitmentLevel(randomScore(random))
                    .build());

            Users leader = normalUsers.get(i % normalUsers.size());
            List<Users> shuffled = new ArrayList<>(normalUsers);
            Collections.shuffle(shuffled, random);

            List<Users> circleMemberUsers = new ArrayList<>();
            circleMemberUsers.add(leader);
            for (Users candidate : shuffled) {
                if (circleMemberUsers.size() >= memberCount) {
                    break;
                }
                if (!candidate.getUserId().equals(leader.getUserId())) {
                    circleMemberUsers.add(candidate);
                }
            }

            members.add(CircleMember.builder()
                    .user(leader)
                    .circle(savedCircle)
                    .role(CircleRole.LEADER)
                    .status(CircleMemberStatus.ACTIVE)
                    .build());

            for (int m = 1; m < circleMemberUsers.size(); m++) {
                members.add(CircleMember.builder()
                        .user(circleMemberUsers.get(m))
                        .circle(savedCircle)
                        .role(CircleRole.MEMBER)
                        .status(CircleMemberStatus.ACTIVE)
                        .build());
            }
            circleUsers.put(savedCircle.getCircleId(), circleMemberUsers);
        }

        circleEnergyProfileRepository.saveAll(profiles);
        circleMemberRepository.saveAll(members);
        return new CircleSeedContext(circles, circleUsers);
    }

    private List<Board> createBoards(List<Circle> circles) {
        List<Board> boards = new ArrayList<>();
        boards.add(Board.builder().boardType(BoardType.NOTICE).name("공지사항").build());
        boards.add(Board.builder().boardType(BoardType.FREE).name("자유게시판").build());

        for (Circle circle : circles) {
            for (int i = 1; i <= CIRCLE_BOARD_PER_CIRCLE; i++) {
                boards.add(Board.builder()
                        .boardType(BoardType.CIRCLE)
                        .name("게시판 " + i)
                        .circleId(circle)
                        .build());
            }
        }

        return boardRepository.saveAll(boards);
    }

    private List<Post> createPosts(
            List<Board> boards,
            List<Users> allUsers,
            Map<Long, List<Users>> circleUsers,
            Random random) {
        List<Post> posts = new ArrayList<>();
        for (Board board : boards) {
            List<Users> authorPool = board.getBoardType() == BoardType.CIRCLE
                    ? circleUsers.get(board.getCircleId().getCircleId())
                    : allUsers;

            for (int i = 1; i <= POSTS_PER_BOARD; i++) {
                Users author = authorPool.get(random.nextInt(authorPool.size()));
                posts.add(Post.builder()
                        .boardId(board)
                        .userId(author)
                        .title("[" + board.getName() + "] 테스트 글 " + i)
                        .content("테스트 데이터 본문입니다.\n게시판: " + board.getName() + "\n순번: " + i)
                        .build());
            }
        }
        return postRepository.saveAll(posts);
    }

    private void createReplies(
            List<Post> posts,
            List<Users> allUsers,
            Map<Long, List<Users>> circleUsers,
            Random random) {
        Map<Long, List<Users>> authorPoolByPost = new LinkedHashMap<>();
        for (Post post : posts) {
            if (post.getBoardId().getBoardType() == BoardType.CIRCLE) {
                Long circleId = post.getBoardId().getCircleId().getCircleId();
                authorPoolByPost.put(post.getPostId(), circleUsers.get(circleId));
            } else {
                authorPoolByPost.put(post.getPostId(), allUsers);
            }
        }

        for (Post post : posts) {
            List<Users> authorPool = authorPoolByPost.get(post.getPostId());
            int totalReplies = 5 + random.nextInt(6); // 5~10
            int parentCount = Math.min(totalReplies, 3 + random.nextInt(4)); // 3~6

            List<Reply> parentReplies = new ArrayList<>();
            for (int i = 0; i < parentCount; i++) {
                Users author = authorPool.get(random.nextInt(authorPool.size()));
                parentReplies.add(Reply.builder()
                        .postId(post)
                        .userId(author)
                        .content("댓글 " + (i + 1) + " - post " + post.getPostId())
                        .parentId(null)
                        .depth(0)
                        .deleted(false)
                        .build());
            }
            List<Reply> savedParents = replyRepository.saveAll(parentReplies);

            int childCount = totalReplies - parentCount;
            if (childCount > 0) {
                List<Reply> childReplies = new ArrayList<>();
                for (int i = 0; i < childCount; i++) {
                    Users author = authorPool.get(random.nextInt(authorPool.size()));
                    Reply parent = savedParents.get(random.nextInt(savedParents.size()));
                    childReplies.add(Reply.builder()
                            .postId(post)
                            .userId(author)
                            .content("대댓글 " + (i + 1) + " - parent " + parent.getReplyId())
                            .parentId(parent)
                            .depth(1)
                            .deleted(false)
                            .build());
                }
                replyRepository.saveAll(childReplies);
            }
        }
    }

    private int randomScore(Random random) {
        return 1 + random.nextInt(5);
    }

    private void logSummary() {
        long users = usersRepository.count();
        long circles = circleRepository.count();
        long boards = boardRepository.count();
        long posts = postRepository.count();
        long replies = replyRepository.count();
        long categories = circleCategoryRepository.count();
        long circleMembers = circleMemberRepository.count();
        log.info("[SEED] 요약 users={}, circles={}, boards={}, posts={}, replies={}, categories={}, circleMembers={}",
                users, circles, boards, posts, replies, categories, circleMembers);
    }

    private record CircleSeedContext(List<Circle> circles, Map<Long, List<Users>> circleUsers) {
    }
}
