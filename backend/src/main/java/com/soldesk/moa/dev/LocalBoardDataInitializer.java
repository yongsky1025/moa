package com.soldesk.moa.dev;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.soldesk.moa.board.board.entity.Board;
import com.soldesk.moa.board.board.entity.constant.BoardType;
import com.soldesk.moa.board.board.repository.BoardRepository;
import com.soldesk.moa.board.post.entity.Post;
import com.soldesk.moa.board.post.repository.PostRepository;
import com.soldesk.moa.board.reply.entity.Reply;
import com.soldesk.moa.board.reply.repository.ReplyRepository;
import com.soldesk.moa.circle.entity.Circle;
import com.soldesk.moa.circle.entity.CircleCategory;
import com.soldesk.moa.circle.entity.constant.CircleStatus;
import com.soldesk.moa.circle.repository.CircleCategoryRepository;
import com.soldesk.moa.circle.repository.CircleRepository;
import com.soldesk.moa.users.entity.Users;
import com.soldesk.moa.users.entity.constant.AuthProvider;
import com.soldesk.moa.users.entity.constant.UserGender;
import com.soldesk.moa.users.entity.constant.UserRole;
import com.soldesk.moa.users.entity.constant.UserStatus;
import com.soldesk.moa.users.repository.UsersRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Log4j2
@Component
@Profile("local")
@RequiredArgsConstructor
public class LocalBoardDataInitializer implements CommandLineRunner {

    private final UsersRepository usersRepository;
    private final CircleCategoryRepository circleCategoryRepository;
    private final CircleRepository circleRepository;
    private final BoardRepository boardRepository;
    private final PostRepository postRepository;
    private final ReplyRepository replyRepository;

    @Override
    public void run(String... args) {
        seedBoardData();
    }

    @Transactional
    public void seedBoardData() {
        Users admin = getOrCreateUser(
                "board-admin@local.test",
                "boardAdmin",
                UserRole.ADMIN,
                "Board Admin");

        Users user = getOrCreateUser(
                "board-user@local.test",
                "boardUser",
                UserRole.USER,
                "Board User");

        CircleCategory category = getOrCreateCategory("테스트카테고리");
        Circle circle = getOrCreateCircle("테스트 서클", category);

        Board noticeBoard = getOrCreateGlobalBoard(BoardType.NOTICE, "공지사항");
        Board freeBoard = getOrCreateGlobalBoard(BoardType.FREE, "자유게시판");
        Board circleBoard = getOrCreateCircleBoard(circle, "서클 자유게시판");

        createPostsIfEmpty(noticeBoard, admin,
                List.of(
                        "서비스 점검 공지",
                        "커뮤니티 운영 가이드",
                        "신규 기능 배포 안내"),
                "공지 게시판 테스트 본문입니다.");

        createPostsIfEmpty(freeBoard, user,
                List.of(
                        "자유게시판 첫 글",
                        "오늘의 소소한 이야기",
                        "프론트/백엔드 질문 있습니다"),
                "자유 게시판 테스트 본문입니다.");

        createPostsIfEmpty(circleBoard, user,
                List.of(
                        "서클 정기 모임 공지",
                        "이번 주 활동 후기",
                        "다음 주 일정 투표"),
                "서클 게시판 테스트 본문입니다.");

        createRepliesIfEmpty(freeBoard, user);
        createRepliesIfEmpty(circleBoard, admin);

        log.info("Local board seed data initialized.");
    }

    private Users getOrCreateUser(String email, String nickname, UserRole role, String name) {
        Optional<Users> found = usersRepository.findByEmail(email);
        if (found.isPresent()) {
            return found.get();
        }

        Users user = Users.builder()
                .name(name)
                .email(email)
                .password("test1234")
                .nickname(nickname)
                .birthDate(LocalDate.of(1995, 1, 1))
                .userRole(role)
                .userGender(UserGender.UNSPECIFIED)
                .provider(AuthProvider.LOCAL)
                .providerId(email)
                .userStatus(UserStatus.ACTIVE)
                .privacyAgreedAt(LocalDateTime.now())
                .build();

        return usersRepository.save(user);
    }

    private CircleCategory getOrCreateCategory(String categoryName) {
        return circleCategoryRepository.findAll().stream()
                .filter(category -> categoryName.equals(category.getCategoryName()))
                .findFirst()
                .orElseGet(() -> circleCategoryRepository.save(
                        CircleCategory.builder()
                                .categoryName(categoryName)
                                .build()));
    }

    private Circle getOrCreateCircle(String circleName, CircleCategory category) {
        return circleRepository.findAll().stream()
                .filter(circle -> circleName.equals(circle.getName()))
                .findFirst()
                .orElseGet(() -> circleRepository.save(
                        Circle.builder()
                                .name(circleName)
                                .description("게시판 테스트용 서클")
                                .status(CircleStatus.OPEN)
                                .maxMember(30)
                                .currentMember(5)
                                .category(category)
                                .build()));
    }

    private Board getOrCreateGlobalBoard(BoardType type, String name) {
        return boardRepository.findByBoardTypeAndCircleIdIsNullAndDeletedFalse(type)
                .orElseGet(() -> boardRepository.save(
                        Board.builder()
                                .boardType(type)
                                .name(name)
                                .circleId(null)
                                .build()));
    }

    private Board getOrCreateCircleBoard(Circle circle, String name) {
        return boardRepository.findByBoardTypeAndCircleId_CircleIdAndDeletedFalse(BoardType.CIRCLE, circle.getCircleId())
                .stream()
                .findFirst()
                .orElseGet(() -> boardRepository.save(
                        Board.builder()
                                .boardType(BoardType.CIRCLE)
                                .name(name)
                                .circleId(circle)
                                .build()));
    }

    private void createPostsIfEmpty(Board board, Users author, List<String> titles, String bodyPrefix) {
        boolean hasPosts = postRepository.findAll().stream()
                .anyMatch(post -> post.getBoardId().getBoardId().equals(board.getBoardId()));
        if (hasPosts) {
            return;
        }

        for (int i = 0; i < titles.size(); i++) {
            postRepository.save(
                    Post.builder()
                            .boardId(board)
                            .userId(author)
                            .title(titles.get(i))
                            .content(bodyPrefix + " (" + (i + 1) + ")")
                            .build());
        }
    }

    private void createRepliesIfEmpty(Board board, Users author) {
        Optional<Post> maybePost = postRepository.findAll().stream()
                .filter(post -> post.getBoardId().getBoardId().equals(board.getBoardId()))
                .findFirst();

        if (maybePost.isEmpty()) {
            return;
        }

        Post target = maybePost.get();
        long replyCount = replyRepository.countByPostId_PostId(target.getPostId());
        if (replyCount > 0) {
            return;
        }

        Reply parent = replyRepository.save(
                Reply.builder()
                        .postId(target)
                        .userId(author)
                        .content("테스트 댓글 1")
                        .parentId(null)
                        .depth(0)
                        .deleted(false)
                        .build());

        replyRepository.save(
                Reply.builder()
                        .postId(target)
                        .userId(author)
                        .content("테스트 대댓글 1-1")
                        .parentId(parent)
                        .depth(1)
                        .deleted(false)
                        .build());
    }
}
