package com.soldesk.moa.admin.dashboard.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.querydsl.core.Tuple;
import com.soldesk.moa.admin.dashboard.dto.circleInfo.AdminCircleResponseDTO;
import com.soldesk.moa.admin.dashboard.dto.circleInfo.AdminCircleSearchDTO;
import com.soldesk.moa.admin.dashboard.dto.circleInfo.PopularCircleDTO;
import com.soldesk.moa.admin.dashboard.dto.maindashboard.AdminMainDTO;
import com.soldesk.moa.admin.dashboard.dto.maindashboard.CircleDataDTO;
import com.soldesk.moa.admin.dashboard.dto.maindashboard.CircleSummaryDTO;
import com.soldesk.moa.admin.dashboard.dto.maindashboard.DailyCountDTO;
import com.soldesk.moa.admin.dashboard.dto.maindashboard.DashboardChartDTO;
import com.soldesk.moa.admin.dashboard.dto.maindashboard.MonthlyCountDTO;
import com.soldesk.moa.admin.dashboard.dto.maindashboard.PostActivitySummaryDTO;
import com.soldesk.moa.admin.dashboard.dto.maindashboard.UserCountDTO;
import com.soldesk.moa.admin.dashboard.dto.maindashboard.UserStatusDTO;
import com.soldesk.moa.admin.dashboard.dto.userInfo.AdminUserResponseDTO;
import com.soldesk.moa.admin.dashboard.dto.userInfo.AdminUserSearchDTO;
import com.soldesk.moa.admin.dashboard.dto.userInfo.UserInfoCircleDTO;
import com.soldesk.moa.admin.dashboard.dto.userInfo.UserInfoDTO;
import com.soldesk.moa.admin.dashboard.dto.userInfo.UserInfoPostDTO;
import com.soldesk.moa.admin.dashboard.dto.userInfo.UserInfoReplyDTO;
import com.soldesk.moa.admin.dashboard.repository.AdminBoardRepository;
import com.soldesk.moa.admin.dashboard.repository.AdminCircleMemberRepository;
import com.soldesk.moa.admin.dashboard.repository.AdminCircleRepository;
import com.soldesk.moa.admin.dashboard.repository.AdminPostRepository;
import com.soldesk.moa.admin.dashboard.repository.AdminReplyRepository;
import com.soldesk.moa.admin.dashboard.repository.AdminScheduleMemberRepository;
import com.soldesk.moa.admin.dashboard.repository.AdminScheduleRepository;
import com.soldesk.moa.admin.dashboard.repository.AdminUsersRepository;
import com.soldesk.moa.board.entity.Post;
import com.soldesk.moa.board.entity.Reply;
import com.soldesk.moa.circle.entity.Circle;
import com.soldesk.moa.circle.entity.CircleMember;
import com.soldesk.moa.common.dto.PageRequestDTO;
import com.soldesk.moa.common.dto.PageResultDTO;
import com.soldesk.moa.users.entity.Users;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminService {

        private final AdminUsersRepository adminUsersRepository;
        private final AdminPostRepository adminBoardRepository;
        private final AdminBoardRepository adminBoardCategoryRepository;
        private final AdminCircleRepository adminCircleRepository;
        private final AdminCircleMemberRepository adminCircleMemberRepository;
        private final AdminReplyRepository adminReplyRepository;
        private final AdminScheduleRepository adminScheduleRepository;
        private final AdminScheduleMemberRepository adminScheduleMemberRepository;
        private final AdminPostRepository adminPostRepository;

        // admin main page
        @Transactional(readOnly = true)
        public AdminMainDTO mainDashBoard() {

                // 유저 수, 성비
                Object[] result1 = adminUsersRepository.getCountAllAndMale();
                Object[] row = (Object[]) result1[0];

                long countTotalUser = (long) row[0];
                long maleUser = (long) row[1];
                long unspecifiedUser = (long) row[2];
                long femaleUser = countTotalUser - maleUser - unspecifiedUser;

                // 0명일 경우 오류방지
                double maleRatio, femaleRatio, unspecifiedRatio;
                if (countTotalUser == 0) {
                        maleRatio = femaleRatio = unspecifiedRatio = 0.0;
                } else {
                        maleRatio = Math.round((double) maleUser / countTotalUser * 1000) / 10.0;
                        unspecifiedRatio = Math.round((double) unspecifiedUser / countTotalUser * 1000) / 10.0;
                        femaleRatio = 100.0 - maleRatio - unspecifiedRatio;
                }

                // 모임에 가입되어있는 유저 수 (모임 가입률)
                long countJoinUser = adminCircleMemberRepository.getCountCircleMember();

                UserCountDTO userCountDTO = entityToUserCountDTO(
                                countTotalUser, maleUser, femaleUser, unspecifiedUser, maleRatio, femaleRatio,
                                unspecifiedRatio, countJoinUser);

                // 최근 한 달간 가입자 and 탈퇴자 수
                LocalDateTime start = LocalDateTime.now().minusMonths(1L);
                LocalDateTime end = LocalDateTime.now();
                long year = end.getYear();
                long month = end.getMonthValue();
                long date = end.getDayOfMonth();
                long signUpCount = adminUsersRepository.getSignUpCount(start, end);
                long withdrawnCount = adminUsersRepository.getWithdrawnUsersCount(start,
                                end);

                UserStatusDTO userStatusDTO = entityToUserStatusDTO(year, month, date,
                                signUpCount, withdrawnCount);

                // 총 모임 수, 카테고리별 모임 수
                long circleCount = adminCircleRepository.count();
                List<Object[]> result2 = adminCircleRepository.getCircleByCategory();
                Function<Object[], CircleDataDTO> function = obj -> {
                        return entityToCircleDataDTO((String) obj[0], (Long) obj[1]);
                };

                List<CircleDataDTO> circleDataDTOs = result2.stream().map(function).collect(Collectors.toList());

                CircleSummaryDTO circleSummaryDTO = entityToCircleSummaryDTO(circleCount,
                                circleDataDTOs);

                // 월별 가입자&탈퇴자 비교
                List<MonthlyCountDTO> signUpChart = new ArrayList<>();
                for (long j = 11; j >= 0; j--) {
                        YearMonth ym = YearMonth.now().minusMonths(j);
                        LocalDateTime targetStart = ym.atDay(1).atStartOfDay();
                        LocalDateTime targetEnd = ym.plusMonths(1).atDay(1).atStartOfDay();

                        long countYear = ym.getYear();
                        long countMonth = ym.getMonthValue();
                        signUpCount = adminUsersRepository.getSignUpCount(targetStart, targetEnd);

                        MonthlyCountDTO monthlyCountDTO = entityToMonthlyCountDTO(countYear,
                                        countMonth, signUpCount);

                        signUpChart.add(monthlyCountDTO);
                }

                List<MonthlyCountDTO> withdrawnChart = new ArrayList<>();
                for (long j = 11; j >= 0; j--) {
                        YearMonth ym = YearMonth.now().minusMonths(j);
                        LocalDateTime targetStart = ym.atDay(1).atStartOfDay();
                        LocalDateTime targetEnd = ym.plusMonths(1).atDay(1).atStartOfDay();

                        long countYear = ym.getYear();
                        long countMonth = ym.getMonthValue();
                        signUpCount = adminUsersRepository.getSignUpCount(targetStart, targetEnd);

                        MonthlyCountDTO monthlyCountDTO = entityToMonthlyCountDTO(countYear,
                                        countMonth, signUpCount);

                        withdrawnChart.add(monthlyCountDTO);
                }

                DashboardChartDTO dashboardChartDTO = entityToDashboardChartDTO(signUpChart,
                                withdrawnChart);

                // entity => dto
                AdminMainDTO dto = AdminMainDTO.builder()
                                .userCountDTO(userCountDTO)
                                .userStatusDTO(userStatusDTO)
                                .circleSummaryDTO(circleSummaryDTO)
                                .dashboardChartDTO(dashboardChartDTO)
                                .build();

                return dto;
        }

        // 유저 정보 일람
        @Transactional(readOnly = true)
        public PageResultDTO<AdminUserResponseDTO> getAllUserInfo(AdminUserSearchDTO searchDTO) {
                Pageable pageable = PageRequest.of(searchDTO.getPage() - 1,
                                searchDTO.getSize(), Sort.by("userId"));
                Page<Users> result = adminUsersRepository.getUsersInfo(pageable, searchDTO);

                List<AdminUserResponseDTO> dtoList = result.getContent().stream().map(this::entityToUserResponseDTO)
                                .collect(Collectors.toList());
                long totalCount = result.getTotalElements();

                PageResultDTO<AdminUserResponseDTO> pageResultDTO = PageResultDTO.<AdminUserResponseDTO>withAll()
                                .dtoList(dtoList)
                                .pageRequestDTO(searchDTO)
                                .totalCount(totalCount)
                                .build();

                return pageResultDTO;
        }

        // 유저 상세프로필(관리자용) 조회
        @Transactional(readOnly = true)
        public UserInfoDTO getUserProfile(Long userId) {
                Object[] result = adminUsersRepository.getUserProfile(userId);
                UserInfoDTO dto = entityToUserInfoDTO((Users) result[0], (Long) result[1], (Long) result[2],
                                (Long) result[3]);

                return dto;
        }

        // 특정 유저 작성 게시글 이력 조회
        @Transactional(readOnly = true)
        public PageResultDTO<UserInfoPostDTO> searchBoardListByUserId(Long userId, PageRequestDTO pageRequestDTO) {
                Pageable pageable = PageRequest.of(pageRequestDTO.getPage() - 1, 10);
                Page<Object[]> result = adminPostRepository.searchBoardListByUserId(userId, pageable);

                long totalCount = result.getTotalElements();
                List<UserInfoPostDTO> dtoList = result.stream().map(obj -> {
                        return entityToUserInfoPostDTO((String) obj[0], (Post) obj[1], (Long) obj[2]);
                }).collect(Collectors.toList());

                PageResultDTO<UserInfoPostDTO> pageResultDTO = PageResultDTO.<UserInfoPostDTO>withAll()
                                .dtoList(dtoList)
                                .totalCount(totalCount)
                                .pageRequestDTO(pageRequestDTO)
                                .build();

                return pageResultDTO;
        }

        // 특정 유저 작성 댓글 이력 조회
        @Transactional(readOnly = true)
        public PageResultDTO<UserInfoReplyDTO> getReplyByUserId(Long userId, PageRequestDTO pageRequestDTO) {
                Pageable pageable = PageRequest.of(pageRequestDTO.getPage() - 1, 10);
                Page<Object[]> result = adminReplyRepository.getReplyByUserId(userId, pageable);

                long totalCount = result.getTotalElements();
                List<UserInfoReplyDTO> dtoList = result.stream().map(obj -> {
                        return entityToUserInfoReplyDTO((String) obj[1], (Reply) obj[0]);
                }).collect(Collectors.toList());

                PageResultDTO<UserInfoReplyDTO> pageResultDTO = PageResultDTO.<UserInfoReplyDTO>withAll()
                                .dtoList(dtoList)
                                .totalCount(totalCount)
                                .pageRequestDTO(pageRequestDTO)
                                .build();

                return pageResultDTO;
        }

        // 특정 유저 가입 모임 조회
        @Transactional(readOnly = true)
        public PageResultDTO<UserInfoCircleDTO> getJoinCircleByUserId(Long userId, PageRequestDTO pageRequestDTO) {
                Pageable pageable = PageRequest.of(pageRequestDTO.getPage() - 1, 10);
                Page<Object[]> result = adminCircleRepository.getJoinCircleByUserId(userId, pageable);

                long totalCount = result.getTotalElements();
                List<UserInfoCircleDTO> dtoList = result.stream().map(obj -> {
                        return entityToUserInfoCircleDTO((Circle) obj[0], (String) obj[1], (String) obj[2],
                                        (CircleMember) obj[3]);
                }).collect(Collectors.toList());

                PageResultDTO<UserInfoCircleDTO> pageResultDTO = PageResultDTO.<UserInfoCircleDTO>withAll()
                                .dtoList(dtoList)
                                .totalCount(totalCount)
                                .pageRequestDTO(pageRequestDTO)
                                .build();

                return pageResultDTO;
        }

        // 모임 리스트 일람
        @Transactional(readOnly = true)
        public PageResultDTO<AdminCircleResponseDTO> getAllCircleInfo(AdminCircleSearchDTO adminCircleSearchDTO) {
                Pageable pageable = PageRequest.of(adminCircleSearchDTO.getPage() - 1, 10);
                Page<Object[]> result = adminCircleRepository.getCircleInfo(pageable, adminCircleSearchDTO);

                long totalCount = result.getTotalElements();
                List<AdminCircleResponseDTO> dtoList = result.stream().map(obj ->

                AdminCircleResponseDTO.builder()
                                .circleId((Long) obj[0])
                                .categoryName((String) obj[1])
                                .circleName((String) obj[2])
                                .leaderName((String) obj[3])
                                .currentMember((Integer) obj[4])
                                .maxMember((Integer) obj[5])
                                .status(obj[6].toString())
                                .build()).collect(Collectors.toList());

                PageResultDTO<AdminCircleResponseDTO> pageResultDTO = PageResultDTO.<AdminCircleResponseDTO>withAll()
                                .dtoList(dtoList)
                                .totalCount(totalCount)
                                .pageRequestDTO(adminCircleSearchDTO)
                                .build();

                return pageResultDTO;
        }

        // 인기모임 top5
        @Transactional(readOnly = true)
        public List<PopularCircleDTO> findPopularCircles() {
                LocalDateTime since = LocalDateTime.now().minusDays(7);
                List<Object[]> circles = adminCircleRepository.findPopularCircles(since, 5);

                return circles.stream().map(c -> PopularCircleDTO.builder()
                                .circleId((Long) c[0])
                                .circleName((String) c[1])
                                .categoryName((String) c[2])
                                .currentMember((Integer) c[3])
                                .score((Double) c[4])
                                .build()).collect(Collectors.toList());

        }

        // 게시글 활동
        @Transactional(readOnly = true)
        public PostActivitySummaryDTO postActivitySummary() {
                LocalDate today = LocalDate.now();
                LocalDateTime start = today.atStartOfDay();
                LocalDateTime end = today.atTime(LocalTime.MAX);
                LocalDate weekAgo = today.minusDays(6);

                // 오늘의 통계
                long todayPostCount = adminPostRepository.countTodayPosts(start, end);
                long todayReplyCount = adminReplyRepository.countTodayReplies(start, end);

                // 주간 통계
                List<DailyCountDTO> weeklyPosts = postActivitytoDto(adminPostRepository.countPostsGroupedByDay(weekAgo),
                                today);
                List<DailyCountDTO> weeklyReplies = postActivitytoDto(
                                adminReplyRepository.countRepliesGroupedByDay(weekAgo), today);

                return PostActivitySummaryDTO.builder()
                                .todayPostCount(todayPostCount)
                                .todayReplyCount(todayReplyCount)
                                .weeklyPosts(weeklyPosts)
                                .weeklyReplies(weeklyReplies)
                                .build();
        }

        // 일별 카운트 반환 전용 메소드
        @Transactional(readOnly = true)
        public List<DailyCountDTO> postActivitytoDto(List<Tuple> tuples, LocalDate today) {

                // mapping
                return IntStream.rangeClosed(0, 6)
                                .mapToObj(i -> today.minusDays(6 - i))
                                .map(date -> {
                                        long count = tuples.stream()
                                                        .filter(t -> {
                                                                // object로 꺼낸 뒤 타입에 따라 나누기
                                                                Object raw = t.get(0, Object.class);
                                                                if (raw == null)
                                                                        return false;

                                                                LocalDate tupleDate;
                                                                if (raw instanceof java.sql.Date) {
                                                                        tupleDate = ((java.sql.Date) raw).toLocalDate();
                                                                } else {
                                                                        // DATE_FORMAT 썼을 때는 String으로 옴
                                                                        tupleDate = LocalDate.parse(raw.toString());
                                                                }
                                                                return date.equals(tupleDate);
                                                        })
                                                        .map(t -> t.get(1, Long.class))
                                                        .findFirst()
                                                        .orElse(0L);

                                        return DailyCountDTO.builder()
                                                        .date(date)
                                                        .count(count)
                                                        .build();
                                })
                                .collect(Collectors.toList());
        }

        // UserCountDTO
        private UserCountDTO entityToUserCountDTO(long countTotalUser,
                        long maleUser,
                        long femaleUser,
                        long unspecifiedUser,
                        double maleRatio,
                        double femaleRatio, double unspecifiedRatio, long countJoinUser) {

                UserCountDTO dto = UserCountDTO.builder()
                                .countTotalUser(countTotalUser)
                                .maleUser(maleUser)
                                .femaleUser(femaleUser)
                                .unspecifiedUser(unspecifiedUser)
                                .maleRatio(maleRatio)
                                .femaleRatio(femaleRatio)
                                .unspecifiedRatio(unspecifiedRatio)
                                .countJoinUser(countJoinUser)
                                .build();

                return dto;
        }

        // UserStatusDTO
        private UserStatusDTO entityToUserStatusDTO(long year, long month, long date,
                        long signUpCount, long withdrawnCount) {

                UserStatusDTO dto = UserStatusDTO.builder()
                                .year(year)
                                .month(month)
                                .date(date)
                                .signUpCount(signUpCount)
                                .withdrawnCount(withdrawnCount)
                                .build();

                return dto;
        }

        // AdminUserResponseDTO
        private AdminUserResponseDTO entityToUserResponseDTO(Users user) {
                AdminUserResponseDTO dto = AdminUserResponseDTO.builder()
                                .age(user.getAge())
                                .birth(user.getBirthDate())
                                .gender(user.getUserGender())
                                .name(user.getName())
                                // .phone(user.getPhone())
                                .role(user.getUserRole())
                                .status(user.getUserStatus())
                                .userId(user.getUserId())
                                .createDate(user.getCreateDate())
                                .build();
                return dto;
        }

        // UserInfoDTO
        private UserInfoDTO entityToUserInfoDTO(Users user, Long countCreateBoard, Long countCreateReply,
                        Long countJoinCircle) {

                UserInfoDTO userInfoDTO = UserInfoDTO.builder()
                                .userId(user.getUserId())
                                .name(user.getName())
                                .age(user.getAge())
                                // .address(user.getAddress())
                                .userStatus(user.getUserStatus())
                                .createDate(user.getCreateDate())
                                .countCreateBoard(countCreateBoard != null ? countCreateBoard.intValue() : 0)
                                .countCreateReply(countCreateReply != null ? countCreateReply.intValue() : 0)
                                .countJoinCircle(countJoinCircle)
                                .build();

                return userInfoDTO;
        }

        // CircleDataDTO
        private CircleDataDTO entityToCircleDataDTO(String categoryName, Long countPerCategory) {
                CircleDataDTO dto = CircleDataDTO.builder()
                                .categoryName(categoryName)
                                .countPerCategory(countPerCategory)
                                .build();

                return dto;
        }

        // CircleSummaryDTO
        private CircleSummaryDTO entityToCircleSummaryDTO(Long circleCount, List<CircleDataDTO> circleDataDTOs) {
                CircleSummaryDTO dto = CircleSummaryDTO.builder()
                                .circleCount(circleCount)
                                .circleDataDTOs(circleDataDTOs)
                                .build();

                return dto;
        }

        // DashboardChartDTO
        private DashboardChartDTO entityToDashboardChartDTO(List<MonthlyCountDTO> signUpChart,
                        List<MonthlyCountDTO> withdrawnChart) {
                DashboardChartDTO dto = DashboardChartDTO.builder()
                                .signUpChart(signUpChart)
                                .withdrawnChart(withdrawnChart)
                                .build();

                return dto;
        }

        // MonthlyCountDTO
        private MonthlyCountDTO entityToMonthlyCountDTO(Long year, Long month, Long count) {
                MonthlyCountDTO dto = MonthlyCountDTO.builder()
                                .year(year)
                                .month(month)
                                .count(count)
                                .build();

                return dto;
        }

        // UserInfoPostDTO
        private UserInfoPostDTO entityToUserInfoPostDTO(String boardName, Post post, Long countReply) {
                UserInfoPostDTO dto = UserInfoPostDTO.builder()
                                .boardName(boardName)
                                .title(post.getTitle())
                                .content(post.getContent())
                                .createDate(post.getCreateDate())
                                .countReply(countReply)
                                .build();
                return dto;
        }

        // UserInfoReplyDTO
        private UserInfoReplyDTO entityToUserInfoReplyDTO(String title, Reply reply) {
                UserInfoReplyDTO dto = UserInfoReplyDTO.builder()
                                .title(title)
                                .content(reply.getContent())
                                .createDate(reply.getCreateDate())
                                .build();

                return dto;
        }

        // UserInfoCircleDTO
        private UserInfoCircleDTO entityToUserInfoCircleDTO(Circle circle, String userName,
                        String categoryName, CircleMember circleMember) {
                UserInfoCircleDTO dto = UserInfoCircleDTO.builder()
                                .userName(userName)
                                .circleName(circle.getName())
                                .currentMember(circle.getCurrentMember())
                                .createDate(circleMember.getCreateDate())
                                .categoryName(categoryName)
                                .role(circleMember.getRole().toString())
                                .build();
                return dto;
        }
}
