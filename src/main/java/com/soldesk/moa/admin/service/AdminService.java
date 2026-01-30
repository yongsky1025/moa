package com.soldesk.moa.admin.service;

import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.soldesk.moa.admin.dto.AdminMainDTO;
import com.soldesk.moa.admin.dto.AdminUserResponseDTO;
import com.soldesk.moa.admin.dto.AdminUserSearchDTO;
import com.soldesk.moa.admin.dto.CircleDataDTO;
import com.soldesk.moa.admin.dto.CircleSummaryDTO;
import com.soldesk.moa.admin.dto.DashboardChartDTO;
import com.soldesk.moa.admin.dto.MonthlyCountDTO;
import com.soldesk.moa.admin.dto.UserCountDTO;
import com.soldesk.moa.admin.dto.UserInfoCircleDTO;
import com.soldesk.moa.admin.dto.UserInfoDTO;
import com.soldesk.moa.admin.dto.UserInfoPostDTO;
import com.soldesk.moa.admin.dto.UserInfoReplyDTO;
import com.soldesk.moa.admin.dto.UserStatusDTO;
import com.soldesk.moa.admin.repository.AdminBoardRepository;
import com.soldesk.moa.admin.repository.AdminPostRepository;
import com.soldesk.moa.admin.repository.AdminCircleMemberRepository;
import com.soldesk.moa.admin.repository.AdminCircleRepository;
import com.soldesk.moa.admin.repository.AdminReplyRepository;
import com.soldesk.moa.admin.repository.AdminScheduleMemberRepository;
import com.soldesk.moa.admin.repository.AdminScheduleRepository;
import com.soldesk.moa.admin.repository.AdminUsersRepository;
import com.soldesk.moa.admin.temporary.Reply;
import com.soldesk.moa.board.entity.Post;
import com.soldesk.moa.circle.entity.Circle;
import com.soldesk.moa.circle.entity.CircleMember;
import com.soldesk.moa.circle.entity.constant.CircleRole;
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

        public AdminMainDTO mainDashBoard() {

                // 유저 수, 성비
                Object[] result1 = adminUsersRepository.getCountAllAndMale();
                Object[] row = (Object[]) result1[0];

                long countTotalUser = (long) row[0];
                long maleUser = (long) row[1];
                long femaleUser = countTotalUser - maleUser;
                double maleRatio = Math.round(((double) maleUser / countTotalUser * 100) *
                                10) / 10.0;
                double femaleRatio = 100 - maleRatio;

                // 모임에 가입되어있는 유저 수 (모임 가입률)
                long countJoinUser = adminCircleMemberRepository.getCountCircleMember();

                UserCountDTO userCountDTO = entityToUserCountDTO(countTotalUser, maleUser,
                                femaleUser, maleRatio,
                                femaleRatio,
                                countJoinUser);

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
        public UserInfoDTO getUserProfile(Long userId) {
                Object[] result = adminUsersRepository.getUserProfile(userId);
                UserInfoDTO dto = entityToUserInfoDTO((Users) result[0], (Long) result[1], (Long) result[2],
                                (Long) result[3]);

                return dto;
        }

        // 특정 유저 작성 게시글 이력 조회
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

        // UserCountDTO
        private UserCountDTO entityToUserCountDTO(long countTotalUser,
                        long maleUser,
                        long femaleUser,
                        double maleRatio,
                        double femaleRatio, long countJoinUser) {

                UserCountDTO dto = UserCountDTO.builder()
                                .countTotalUser(countTotalUser)
                                .maleUser(maleUser)
                                .femaleUser(femaleUser)
                                .maleRatio(maleRatio)
                                .femaleRatio(femaleRatio)
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
                                .phone(user.getPhone())
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
                                .address(user.getAddress())
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
