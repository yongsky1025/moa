package com.soldesk.moa.admin.service;

import java.time.LocalDateTime;
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
import com.soldesk.moa.admin.dto.CircleDataDTO;
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

        // admin main page
        public AdminMainDTO getMoaInfo() {

                // 유저 수, 성비
                Object[] result1 = adminUsersRepository.getCountAllAndMale();
                Object[] row = (Object[]) result1[0];

                long countTotalUser = (long) row[0];
                long countMale = (long) row[1];
                long countFemale = countTotalUser - countMale;
                double maleRatio = Math.round(((double) countMale / countTotalUser * 100) *
                                10) / 10.0;
                double femaleRatio = 100 - maleRatio;

                UserCountDTO userCountDTO = entityToUserCountDTO(countTotalUser, countMale,
                                countFemale, maleRatio,
                                femaleRatio,
                                countFemale);

                // 최근 한 달간 가입자 and 탈퇴자 수
                LocalDateTime start = LocalDateTime.now().minusMonths(1L);
                LocalDateTime end = LocalDateTime.now();
                long signUpYear = end.getYear();
                long signUpMonth = end.getMonthValue();
                long date = end.getDayOfMonth();
                long signUpCount = adminUsersRepository.getSignUpCount(start, end);
                long withdrawnCount = adminUsersRepository.getWithdrawnUsersCount(start,
                                end);

                UserStatusDTO userStatusDTO = entityToUserStatusDTO(signUpYear, signUpMonth,
                                date, 0,
                                0,
                                signUpCount, withdrawnCount);

                // 모임에 가입되어있는 유저 수 (모임 가입률)
                long countJoinUser = adminCircleMemberRepository.getCountCircleMember();
                userCountDTO.setCountJoinUser(countJoinUser);

                // 총 모임 수, 카테고리별 모임 수
                long circleCount = adminCircleRepository.findAll().size();
                List<Object[]> result2 = adminCircleRepository.getCircleByCategory();
                List<CircleDataDTO> circleDataDTOs = entityToCircleDataDTO(result2);

                // entity => dto
                AdminMainDTO dto = AdminMainDTO.builder()
                                .userCountDTO(userCountDTO)
                                .userStatusDTO(userStatusDTO)
                                .circleDataDTOs(circleDataDTOs)
                                .circleCount(circleCount)
                                .build();

                return dto;
        }

        // 유저 정보 일람
        // public PageResultDTO<UserInfoDTO> getAllUserInfo(PageRequestDTO requestDTO) {
        // Pageable pageable = PageRequest.of(requestDTO.getPage(),
        // requestDTO.getSize(), Sort.by("userId"));
        // Page<Object[]> result = adminUsersRepository.getUsersInfo(pageable,
        // requestDTO.getType(),
        // requestDTO.getKeyword());

        // Function<Object[], UserInfoDTO> function = infoDto ->
        // entityToUserInfoDTO((Users) infoDto[0],
        // (int) infoDto[1], (int) infoDto[2]);

        // List<UserInfoDTO> dtoList =
        // result.stream().map(function).collect(Collectors.toList());
        // long totalcount = result.getTotalElements();

        // PageResultDTO<UserInfoDTO> pageResultDTO =
        // PageResultDTO.<UserInfoDTO>withAll()
        // .dtoList(dtoList)
        // .pageRequestDTO(requestDTO)
        // .totalCount(totalcount)
        // .build();

        // return pageResultDTO;
        // }
        public PageResultDTO<UserInfoDTO> getAllUserInfo(PageRequestDTO requestDTO) {
                Pageable pageable = PageRequest.of(requestDTO.getPage(),
                                requestDTO.getSize(), Sort.by("userId"));
                Page<Users> result = adminUsersRepository.getUsersInfo(pageable, requestDTO.getType(),
                                requestDTO.getKeyword());

                List<UserInfoDTO> dtoList = new ArrayList<>();

                List<Users> listUsers = result.getContent();
                listUsers.forEach(user -> {
                        dtoList.add(entityToUserInfoDTO(user, 0L, 0L));
                });

                long totalCount = result.getTotalElements();

                PageResultDTO<UserInfoDTO> pageResultDTO = PageResultDTO.<UserInfoDTO>withAll()
                                .dtoList(dtoList)
                                .pageRequestDTO(requestDTO)
                                .totalCount(totalCount)
                                .build();

                return pageResultDTO;
        }

        // 유저 상세프로필(관리자용) 조회
        public UserInfoDTO getUserProfile(Long userId) {
                Object[] result = adminUsersRepository.getUserProfile(userId);
                UserInfoDTO dto = entityToUserInfoDTO((Users) result[0], (Long) result[1], (Long) result[2]);

                return dto;
        }

        // UserCountDTO
        private UserCountDTO entityToUserCountDTO(long countTotalUser,
                        long countMale,
                        long countFemale,
                        double maleRatio,
                        double femaleRatio, long countJoinUser) {

                UserCountDTO dto = UserCountDTO.builder()
                                .countTotalUser(countTotalUser)
                                .countMale(countMale)
                                .countFemale(countFemale)
                                .maleRatio(maleRatio)
                                .femaleRatio(femaleRatio)
                                .countJoinUser(null)
                                .build();

                return dto;
        }

        // UserStatusDTO
        private UserStatusDTO entityToUserStatusDTO(long signUpYear, long signUpMonth, long date,
                        long withdrawYear, long withdrawMonth, long signUpCount, long withdrawnCount) {

                UserStatusDTO dto = UserStatusDTO.builder()
                                .signUpYear(signUpYear)
                                .signUpMonth(signUpMonth)
                                .date(date)
                                .withdrawYear(withdrawYear)
                                .withdrawMonth(withdrawMonth)
                                .signUpCount(signUpCount)
                                .withdrawnCount(withdrawnCount)
                                .build();

                return dto;
        }

        // UserInfoDTO
        private UserInfoDTO entityToUserInfoDTO(Users user, Long countCreateBoard, Long countCreateReply) {

                UserInfoDTO userInfoDTO = UserInfoDTO.builder()
                                .userId(user.getUserId())
                                .name(user.getName())
                                .age(user.getAge())
                                .address(user.getAddress())
                                .userStatus(user.getUserStatus())
                                .createDate(user.getCreateDate())
                                .countCreateBoard(countCreateBoard != null ? countCreateBoard.intValue() : 0)
                                .countCreateReply(countCreateReply != null ? countCreateReply.intValue() : 0)
                                .build();

                return userInfoDTO;
        }

        // CircleDataDTO
        private List<CircleDataDTO> entityToCircleDataDTO(List<Object[]> result) {
                List<CircleDataDTO> dtoList = new ArrayList<>();
                result.stream().forEach(obj -> {
                        CircleDataDTO circleDataDTO = CircleDataDTO.builder()
                                        .categoryName((String) obj[0])
                                        .countPerCategory((Long) obj[1])
                                        .build();
                        dtoList.add(circleDataDTO);
                });

                return dtoList;
        }

}
