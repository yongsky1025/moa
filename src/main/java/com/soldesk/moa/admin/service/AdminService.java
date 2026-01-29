package com.soldesk.moa.admin.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.cglib.core.Local;
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
import com.soldesk.moa.admin.dto.UserInfoDTO;
import com.soldesk.moa.admin.dto.UserStatusDTO;
import com.soldesk.moa.admin.repository.AdminBoardRepository;
import com.soldesk.moa.admin.repository.AdminPostRepository;
import com.soldesk.moa.admin.repository.AdminCircleMemberRepository;
import com.soldesk.moa.admin.repository.AdminCircleRepository;
import com.soldesk.moa.admin.repository.AdminReplyRepository;
import com.soldesk.moa.admin.repository.AdminScheduleMemberRepository;
import com.soldesk.moa.admin.repository.AdminScheduleRepository;
import com.soldesk.moa.admin.repository.AdminUsersRepository;
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
                long circleCount = adminCircleRepository.findAll().size();
                List<Object[]> result2 = adminCircleRepository.getCircleByCategory();
                Function<Object[], CircleDataDTO> function = obj -> {
                        return entityToCircleDataDTO((String) obj[0], (Long) obj[1]);
                };

                List<CircleDataDTO> circleDataDTOs = result2.stream().map(function).collect(Collectors.toList());

                CircleSummaryDTO circleSummaryDTO = entityToCircleSummaryDTO(circleCount,
                                circleDataDTOs);

                // 기간별 가입자 탈퇴자 비교 1년
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
}
