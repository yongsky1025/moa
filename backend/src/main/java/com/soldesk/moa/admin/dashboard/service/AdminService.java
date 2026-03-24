package com.soldesk.moa.admin.dashboard.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.Comparator;
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
import com.soldesk.moa.admin.dashboard.dto.postInfo.AdminPostDetailDTO;
import com.soldesk.moa.admin.dashboard.dto.postInfo.AdminPostDetailDTO.AdminReplyDTO;
import com.soldesk.moa.admin.dashboard.dto.postInfo.AdminPostResponseDTO;
import com.soldesk.moa.admin.dashboard.dto.postInfo.AdminPostSearchDTO;
import com.soldesk.moa.admin.dashboard.dto.circleInfo.AdminCircleCategoryRequestDTO;
import com.soldesk.moa.admin.dashboard.dto.circleInfo.AdminCircleDetailDTO;
import com.soldesk.moa.admin.dashboard.dto.circleInfo.AdminCircleMemberDTO;
import com.soldesk.moa.admin.dashboard.dto.circleInfo.AdminCirclePostDTO;
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
import com.soldesk.moa.admin.dashboard.repository.AdminCircleCategoryRepository;
import com.soldesk.moa.admin.dashboard.repository.AdminCircleMemberRepository;
import com.soldesk.moa.admin.dashboard.repository.AdminCircleRepository;
import com.soldesk.moa.admin.dashboard.repository.AdminPostRepository;
import com.soldesk.moa.admin.dashboard.repository.AdminReplyRepository;
import com.soldesk.moa.admin.dashboard.repository.AdminScheduleMemberRepository;
import com.soldesk.moa.admin.dashboard.repository.AdminScheduleRepository;
import com.soldesk.moa.admin.dashboard.repository.AdminUsersRepository;
import com.soldesk.moa.board.entity.Board;
import com.soldesk.moa.post.entity.Post;
import com.soldesk.moa.reply.entity.Reply;
import com.soldesk.moa.board.entity.constant.BoardType;
import com.soldesk.moa.board.repository.BoardRepository;
import com.soldesk.moa.circle.entity.Circle;
import com.soldesk.moa.circle.entity.CircleCategory;
import com.soldesk.moa.circle.entity.CircleMember;
import com.soldesk.moa.circle.entity.constant.CircleMemberStatus;
import com.soldesk.moa.admin.report.entity.Sanction;
import com.soldesk.moa.admin.report.entity.constant.ReportTargetType;
import com.soldesk.moa.admin.report.entity.constant.SanctionState;
import com.soldesk.moa.admin.report.repository.SanctionRepository;
import com.soldesk.moa.admin.dashboard.dto.placeInfo.AdminPlaceDetailDTO;
import com.soldesk.moa.admin.dashboard.dto.placeInfo.AdminPlaceResponseDTO;
import com.soldesk.moa.admin.dashboard.dto.placeInfo.AdminPlaceSearchDTO;
import com.soldesk.moa.common.dto.PageRequestDTO;
import com.soldesk.moa.common.dto.PageResultDTO;
import com.soldesk.moa.common.entity.Image;
import com.soldesk.moa.place.dto.PlaceCreateDTO;
import com.soldesk.moa.place.entity.Place;
import com.soldesk.moa.place.entity.PlaceClosedDay;
import com.soldesk.moa.place.entity.PlaceTag;
import com.soldesk.moa.place.entity.Tag;
import com.soldesk.moa.place.entity.constant.ClosedType;
import com.soldesk.moa.place.entity.constant.PlaceStatus;
import com.soldesk.moa.place.repository.PlaceClosedDayRepository;
import com.soldesk.moa.place.repository.PlaceRepository;
import com.soldesk.moa.place.repository.PlaceTagRepository;
import com.soldesk.moa.place.repository.TagRepository;
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
        private final AdminCircleCategoryRepository adminCircleCategoryRepository;
        private final BoardRepository boardRepository;
        private final SanctionRepository sanctionRepository;
        private final PlaceRepository placeRepository;
        private final TagRepository tagRepository;
        private final PlaceTagRepository placeTagRepository;
        private final PlaceClosedDayRepository placeClosedDayRepository;

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
                // TODO: Hibernate 6 enum 타입 수정 필요
                // long withdrawnCount = adminUsersRepository.getWithdrawnUsersCount(start,
                // end);
                long withdrawnCount = 0L;

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
                        long withdrawnCount2 = adminUsersRepository.getWithdrawnUsersCount(targetStart, targetEnd);

                        MonthlyCountDTO monthlyCountDTO = entityToMonthlyCountDTO(countYear,
                                        countMonth, withdrawnCount2);

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
                Pageable pageable = PageRequest.of(adminCircleSearchDTO.getPage() - 1, adminCircleSearchDTO.getSize());
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

        // 모임 상세 조회
        @Transactional(readOnly = true)
        public AdminCircleDetailDTO getCircleDetail(Long circleId) {
                Object[] result = adminCircleRepository.getCircleDetail(circleId);
                if (result == null) {
                        throw new IllegalArgumentException("존재하지 않는 모임입니다. id=" + circleId);
                }

                Circle circle = (Circle) result[0];
                String categoryName = (String) result[1];
                String leaderName = (String) result[2];
                Long leaderId = (Long) result[3];
                Long postCount = (Long) result[4];

                Image coverImage = circle.getCoverImage();
                String coverImageUrl = coverImage != null
                                ? coverImage.getPath() + "/" + coverImage.getUuid() + "_" + coverImage.getName()
                                : null;

                return AdminCircleDetailDTO.builder()
                                .circleId(circle.getCircleId())
                                .circleName(circle.getName())
                                .description(circle.getDescription())
                                .categoryName(categoryName)
                                .leaderName(leaderName)
                                .leaderId(leaderId)
                                .currentMember(circle.getCurrentMember())
                                .maxMember(circle.getMaxMember())
                                .status(circle.getStatus().toString())
                                .coverImageUrl(coverImageUrl)
                                .createDate(circle.getCreateDate())
                                .totalPosts(postCount != null ? postCount.intValue() : 0)
                                .build();
        }

        // 모임 가입 회원 목록
        @Transactional(readOnly = true)
        public PageResultDTO<AdminCircleMemberDTO> getCircleMembers(Long circleId, PageRequestDTO pageRequestDTO) {
                Pageable pageable = PageRequest.of(pageRequestDTO.getPage() - 1, pageRequestDTO.getSize());
                Page<Object[]> result = adminCircleRepository.getCircleMembers(circleId, pageable);

                long totalCount = result.getTotalElements();
                List<AdminCircleMemberDTO> dtoList = result.stream().map(obj -> AdminCircleMemberDTO.builder()
                                .userId((Long) obj[0])
                                .userName((String) obj[1])
                                .gender(obj[2] != null ? obj[2].toString() : "UNSPECIFIED")
                                .role(obj[3].toString())
                                .status(obj[4].toString())
                                .joinDate((LocalDateTime) obj[5])
                                .build()).collect(Collectors.toList());

                return PageResultDTO.<AdminCircleMemberDTO>withAll()
                                .dtoList(dtoList)
                                .totalCount(totalCount)
                                .pageRequestDTO(pageRequestDTO)
                                .build();
        }

        // 모임 최근 게시물
        @Transactional(readOnly = true)
        public PageResultDTO<AdminCirclePostDTO> getCirclePosts(Long circleId, PageRequestDTO pageRequestDTO) {
                Pageable pageable = PageRequest.of(pageRequestDTO.getPage() - 1, pageRequestDTO.getSize());
                Page<Object[]> result = adminCircleRepository.getCirclePosts(circleId, pageable);

                long totalCount = result.getTotalElements();
                List<AdminCirclePostDTO> dtoList = result.stream().map(obj -> AdminCirclePostDTO.builder()
                                .postId((Long) obj[0])
                                .title((String) obj[1])
                                .authorName((String) obj[2])
                                .viewCount((Integer) obj[3])
                                .replyCount(((Long) obj[4]).intValue())
                                .createDate((LocalDateTime) obj[5])
                                .build()).collect(Collectors.toList());

                return PageResultDTO.<AdminCirclePostDTO>withAll()
                                .dtoList(dtoList)
                                .totalCount(totalCount)
                                .pageRequestDTO(pageRequestDTO)
                                .build();
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

        // 관리자 서클 카테고리 추가
        @Transactional
        public void createCircleCategory(AdminCircleCategoryRequestDTO dto) {
                CircleCategory category = CircleCategory.builder()
                                .categoryName(dto.getCategoryName())
                                .build();

                adminCircleCategoryRepository.save(category);
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

        // ===== 게시글 관리 =====

        // 게시글 목록 조회 (필터/검색/정렬)
        @Transactional(readOnly = true)
        public PageResultDTO<AdminPostResponseDTO> getAdminPosts(AdminPostSearchDTO searchDTO) {
                Pageable pageable = PageRequest.of(searchDTO.getPage() - 1, searchDTO.getSize());
                Page<Tuple> page = adminPostRepository.searchAdminPosts(searchDTO, pageable);

                List<AdminPostResponseDTO> dtoList = page.getContent().stream()
                                .map(tuple -> {
                                        Post post = tuple.get(0, Post.class);
                                        String boardName = tuple.get(1, String.class);
                                        Long replyCount = tuple.get(2, Long.class);
                                        String circleName = tuple.get(3, String.class);

                                        Board board = post.getBoardId();
                                        return AdminPostResponseDTO.builder()
                                                        .postId(post.getPostId())
                                                        .title(post.getTitle())
                                                        .authorName(post.getUserId().getName())
                                                        .authorId(post.getUserId().getUserId())
                                                        .boardName(boardName)
                                                        .boardType(board.getBoardType())
                                                        .circleName(circleName)
                                                        .circleId(board.getCircleId() != null
                                                                        ? board.getCircleId().getCircleId()
                                                                        : null)
                                                        .viewCount(post.getViewCount())
                                                        .replyCount(replyCount != null ? replyCount : 0L)
                                                        .deleted(post.isDeleted())
                                                        .createDate(post.getCreateDate())
                                                        .build();
                                })
                                .toList();

                return PageResultDTO.<AdminPostResponseDTO>withAll()
                                .dtoList(dtoList)
                                .pageRequestDTO(searchDTO)
                                .totalCount(page.getTotalElements())
                                .build();
        }

        // 게시글 상세 조회 (댓글 포함)
        @Transactional(readOnly = true)
        public AdminPostDetailDTO getPostDetail(Long postId) {
                Post post = adminPostRepository.findById(postId)
                                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 게시글입니다."));

                Board board = post.getBoardId();
                Users author = post.getUserId();

                // 댓글 목록 조회 (admin용 repository 사용)
                List<Reply> replies = adminReplyRepository.findByPostId_PostIdOrderByCreateDateAsc(postId);

                List<AdminReplyDTO> replyDTOs = replies.stream()
                                .sorted(Comparator.comparing(Reply::getCreateDate))
                                .map(reply -> AdminReplyDTO.builder()
                                                .replyId(reply.getReplyId())
                                                .content(reply.isDeleted() ? "삭제된 댓글입니다." : reply.getContent())
                                                .authorName(reply.getUserId().getName())
                                                .authorId(reply.getUserId().getUserId())
                                                .parentId(reply.getParentId() != null
                                                                ? reply.getParentId().getReplyId()
                                                                : null)
                                                .depth(reply.getDepth())
                                                .deleted(reply.isDeleted())
                                                .createDate(reply.getCreateDate())
                                                .build())
                                .toList();

                // 삭제된 게시글인 경우 CONTENT_DELETE 활성 제재 ID 조회
                Long sanctionId = null;
                if (post.isDeleted()) {
                        sanctionId = sanctionRepository
                                        .findFirstByTargetTypeAndTargetIdAndSanctionStateOrderByCreateDateDesc(
                                                        ReportTargetType.POST, postId, SanctionState.ACTIVE)
                                        .map(Sanction::getId)
                                        .orElse(null);
                }

                return AdminPostDetailDTO.builder()
                                .postId(post.getPostId())
                                .title(post.getTitle())
                                .content(post.getContent())
                                .authorName(author.getName())
                                .authorId(author.getUserId())
                                .boardName(board.getName())
                                .boardType(board.getBoardType())
                                .circleName(board.getCircleId() != null ? board.getCircleId().getName() : null)
                                .circleId(board.getCircleId() != null ? board.getCircleId().getCircleId() : null)
                                .boardId(board.getBoardId())
                                .viewCount(post.getViewCount())
                                .deleted(post.isDeleted())
                                .sanctionId(sanctionId)
                                .createDate(post.getCreateDate())
                                .updateDate(post.getUpdateDate())
                                .replies(replyDTOs)
                                .build();
        }

        // ===== 공지사항 관리 =====

        // 공지사항 작성
        @Transactional
        public Long createNotice(Long adminId, String title, String content) {
                Users admin = adminUsersRepository.findById(adminId)
                                .orElseThrow(() -> new IllegalArgumentException("해당 관리자를 찾을 수 없습니다."));

                Board noticeBoard = boardRepository.findByBoardTypeAndCircleIdIsNullAndDeletedFalse(BoardType.NOTICE)
                                .orElseThrow(() -> new IllegalArgumentException("공지사항 게시판을 찾을 수 없습니다."));

                Post notice = Post.builder()
                                .title(title)
                                .content(content)
                                .userId(admin)
                                .boardId(noticeBoard)
                                .build();

                return adminPostRepository.save(notice).getPostId();
        }

        // 공지사항 수정
        @Transactional
        public void updateNotice(Long postId, String title, String content) {
                Post post = adminPostRepository.findById(postId)
                                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 게시글입니다."));

                if (post.getBoardId().getBoardType() != BoardType.NOTICE) {
                        throw new IllegalArgumentException("공지사항이 아닙니다.");
                }

                post.changeTitle(title);
                post.changeContent(content);
        }

        // 공지사항 삭제 (soft delete - 제재 시스템 미사용)
        @Transactional
        public void deleteNotice(Long postId) {
                Post post = adminPostRepository.findById(postId)
                                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 게시글입니다."));

                if (post.getBoardId().getBoardType() != BoardType.NOTICE) {
                        throw new IllegalArgumentException("공지사항이 아닙니다.");
                }

                post.markDeleted();
        }

        // 공지사항 복원
        @Transactional
        public void restoreNotice(Long postId) {
                Post post = adminPostRepository.findById(postId)
                                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 게시글입니다."));

                if (post.getBoardId().getBoardType() != BoardType.NOTICE) {
                        throw new IllegalArgumentException("공지사항이 아닙니다.");
                }

                if (!post.isDeleted()) {
                        throw new IllegalStateException("삭제되지 않은 게시글은 복원할 수 없습니다.");
                }

                post.restore();
        }

        // ── 장소 관리 ──────────────────────────────────────────────────────

        // 장소 생성
        public Long createPlace(PlaceCreateDTO dto) {
                LocalTime openTime = LocalTime.of(dto.openTimeHour(), dto.openTimeMinute());
                LocalTime closeTime = LocalTime.of(dto.closeTimeHour(), dto.closeTimeMinute());

                if (openTime.isAfter(closeTime)) {
                        throw new IllegalArgumentException("운영시간이 올바르지 않음");
                }

                Place place = Place.builder()
                                .name(dto.name())
                                .address(dto.address())
                                .city(dto.city())
                                .district(dto.district())
                                .latitude(dto.latitude())
                                .longitude(dto.longitude())
                                .capacity(dto.capacity())
                                .pricePerHour(dto.pricePerHour())
                                .description(dto.description())
                                .openTime(openTime)
                                .closeTime(closeTime)
                                .minReservationMinutes(dto.minReservationMinutes())
                                .maxReservationMinutes(dto.maxReservationMinutes())
                                .build();

                placeRepository.save(place);

                List<Tag> tags = tagRepository.findAllById(dto.tagIds());
                List<PlaceTag> placeTags = tags.stream()
                                .map(tag -> PlaceTag.builder().place(place).tag(tag).build())
                                .toList();
                placeTagRepository.saveAll(placeTags);

                List<PlaceClosedDay> closedDays = dto.placeClosedDays().stream()
                                .map(day -> PlaceClosedDay.builder()
                                                .place(place)
                                                .dayOfWeek(day.dayOfWeek())
                                                .date(day.date())
                                                .reason(day.reason())
                                                .closedType(ClosedType.valueOf(day.closedType()))
                                                .build())
                                .toList();
                placeClosedDayRepository.saveAll(closedDays);

                return place.getId();
        }

        // 장소 수정
        public Long updatePlace(Long id, PlaceCreateDTO dto) {
                Place place = placeRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("place not found"));

                place.setAddress(dto.address());
                place.setCapacity(dto.capacity());
                place.setCity(dto.city());
                place.setDescription(dto.description());
                place.setDistrict(dto.district());
                place.setMinReservationMinutes(dto.minReservationMinutes());
                place.setMaxReservationMinutes(dto.maxReservationMinutes());
                place.setName(dto.name());
                place.setPricePerHour(dto.pricePerHour());

                return place.getId();
        }

        // 장소 소프트 삭제
        public void deletePlace(Long id) {
                Place place = placeRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("place not found"));
                place.setStatus(PlaceStatus.INACTIVE);
        }

        // 장소 목록 조회 (검색/필터/정렬)
        @Transactional(readOnly = true)
        public PageResultDTO<AdminPlaceResponseDTO> getAdminPlaces(AdminPlaceSearchDTO searchDTO) {
                Pageable pageable = PageRequest.of(searchDTO.getPage() - 1, searchDTO.getSize());
                Page<Place> page = placeRepository.searchAdminPlaces(searchDTO, pageable);

                List<AdminPlaceResponseDTO> dtoList = page.getContent().stream()
                                .map(place -> AdminPlaceResponseDTO.builder()
                                                .id(place.getId())
                                                .name(place.getName())
                                                .address(place.getAddress())
                                                .city(place.getCity())
                                                .district(place.getDistrict())
                                                .capacity(place.getCapacity())
                                                .pricePerHour(place.getPricePerHour())
                                                .avgRating(place.getAverageRating() != null ? place.getAverageRating()
                                                                : 0.0)
                                                .reviewCount(place.getReviewCount() != null ? place.getReviewCount()
                                                                : 0)
                                                .status(place.getStatus().name())
                                                .build())
                                .toList();

                return PageResultDTO.<AdminPlaceResponseDTO>withAll()
                                .dtoList(dtoList)
                                .pageRequestDTO(searchDTO)
                                .totalCount(page.getTotalElements())
                                .build();
        }

        // 장소 단건 조회 (수정 페이지용)
        @Transactional(readOnly = true)
        public AdminPlaceDetailDTO getAdminPlace(Long id) {
                Place place = placeRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("place not found"));

                List<Long> tagIds = place.getTags().stream()
                                .map(pt -> pt.getTag().getId())
                                .toList();

                List<AdminPlaceDetailDTO.ClosedDayDTO> closedDays = place.getPlaceClosedDays().stream()
                                .map(cd -> AdminPlaceDetailDTO.ClosedDayDTO.builder()
                                                .id(cd.getId())
                                                .dayOfWeek(cd.getDayOfWeek() != null ? cd.getDayOfWeek().name() : null)
                                                .date(cd.getDate() != null ? cd.getDate().toString() : null)
                                                .reason(cd.getReason())
                                                .closedType(cd.getClosedType().name())
                                                .build())
                                .toList();

                return AdminPlaceDetailDTO.builder()
                                .id(place.getId())
                                .name(place.getName())
                                .address(place.getAddress())
                                .city(place.getCity())
                                .district(place.getDistrict())
                                .latitude(place.getLatitude())
                                .longitude(place.getLongitude())
                                .capacity(place.getCapacity())
                                .pricePerHour(place.getPricePerHour())
                                .description(place.getDescription())
                                .openTimeHour(place.getOpenTime().getHour())
                                .openTimeMinute(place.getOpenTime().getMinute())
                                .closeTimeHour(place.getCloseTime().getHour())
                                .closeTimeMinute(place.getCloseTime().getMinute())
                                .minReservationMinutes(place.getMinReservationMinutes())
                                .maxReservationMinutes(place.getMaxReservationMinutes())
                                .status(place.getStatus().name())
                                .avgRating(place.getAverageRating() != null ? place.getAverageRating() : 0.0)
                                .reviewCount(place.getReviewCount() != null ? place.getReviewCount() : 0)
                                .tagIds(tagIds)
                                .closedDays(closedDays)
                                .build();
        }

        // 특정 휴무일 목록 조회
        @Transactional(readOnly = true)
        public List<AdminPlaceDetailDTO.ClosedDayDTO> getPlaceClosedDays(Long placeId) {
                Place place = placeRepository.findById(placeId)
                                .orElseThrow(() -> new RuntimeException("place not found"));

                return place.getPlaceClosedDays().stream()
                                .filter(cd -> cd.getClosedType() == ClosedType.HOLIDAY)
                                .map(cd -> AdminPlaceDetailDTO.ClosedDayDTO.builder()
                                                .id(cd.getId())
                                                .date(cd.getDate() != null ? cd.getDate().toString() : null)
                                                .reason(cd.getReason())
                                                .closedType(cd.getClosedType().name())
                                                .build())
                                .toList();
        }

        // 특정 휴무일 추가
        public AdminPlaceDetailDTO.ClosedDayDTO addPlaceClosedDay(Long placeId, String date, String reason) {
                Place place = placeRepository.findById(placeId)
                                .orElseThrow(() -> new RuntimeException("place not found"));

                PlaceClosedDay closedDay = PlaceClosedDay.builder()
                                .place(place)
                                .date(LocalDate.parse(date))
                                .reason(reason)
                                .closedType(ClosedType.HOLIDAY)
                                .build();

                placeClosedDayRepository.save(closedDay);

                return AdminPlaceDetailDTO.ClosedDayDTO.builder()
                                .id(closedDay.getId())
                                .date(closedDay.getDate().toString())
                                .reason(closedDay.getReason())
                                .closedType(closedDay.getClosedType().name())
                                .build();
        }

        // 특정 휴무일 삭제
        public void removePlaceClosedDay(Long placeId, Long closedDayId) {
                PlaceClosedDay closedDay = placeClosedDayRepository.findById(closedDayId)
                                .orElseThrow(() -> new RuntimeException("closed day not found"));

                if (!closedDay.getPlace().getId().equals(placeId)) {
                        throw new IllegalArgumentException("해당 장소의 휴무일이 아닙니다.");
                }

                placeClosedDayRepository.delete(closedDay);
        }

        // 변환 전용 메소드

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
                                // .phone(user.getPhone()) // phone 필드 미사용
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
                                // .address(user.getAddress()) // address 필드 미사용
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
                                .circleId(circle.getCircleId())
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
