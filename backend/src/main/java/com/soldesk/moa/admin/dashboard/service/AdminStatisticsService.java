package com.soldesk.moa.admin.dashboard.service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.querydsl.core.Tuple;
import com.soldesk.moa.admin.dashboard.dto.statistic.AgeGroupDTO;
import com.soldesk.moa.admin.dashboard.dto.statistic.CircleSurvivalDTO;
import com.soldesk.moa.admin.dashboard.repository.AdminCircleRepository;
import com.soldesk.moa.admin.dashboard.repository.AdminUsersRepository;
import com.soldesk.moa.users.entity.constant.UserGender;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminStatisticsService {

    private final AdminUsersRepository adminUsersRepository;
    private final AdminCircleRepository adminCircleRepository;

    // 연령대별 유저 수
    @Transactional(readOnly = true)
    public List<AgeGroupDTO> getAgeGroup() {
        List<Object[]> result = adminUsersRepository.getAgeGroup();

        return result.stream().map(group -> AgeGroupDTO.builder()
                .ageGroup(String.valueOf(group[0]))
                .userCount(((Number) group[1]).longValue())
                .countMale(((Number) group[2]).longValue())
                .countFemale(((Number) group[3]).longValue())
                .build())
                .collect(Collectors.toList());
    }

    // 연령대별 모임 참여자 수
    @Transactional(readOnly = true)
    public List<AgeGroupDTO> findAgeRangeParticipation() {

        List<Tuple> tuples = adminUsersRepository.findAgeRangeParticipation();

        Map<String, AgeGroupDTO.AgeGroupDTOBuilder> map = new HashMap<>();

        for (Tuple tuple : tuples) {
            String ageGroup = String.valueOf(tuple.get(0, Integer.class));
            UserGender gender = tuple.get(1, UserGender.class);
            Long count = tuple.get(2, Long.class);

            map.putIfAbsent(ageGroup, AgeGroupDTO.builder()
                    .ageGroup(ageGroup)
                    .countMale(0)
                    .countFemale(0)
                    .countOther(0));

            var builder = map.get(ageGroup);

            if (gender == UserGender.MALE) {
                builder.countMale(count);
            } else if (gender == UserGender.FEMALE) {
                builder.countFemale((count));
            } else {
                builder.countOther(count);
            }
        }

        return map.values().stream()
                .map(builder -> {
                    AgeGroupDTO dto = builder.build();

                    long total = dto.countMale() + dto.countFemale() + dto.countOther();

                    return AgeGroupDTO.builder()
                            .ageGroup(dto.ageGroup())
                            .userCount(total)
                            .countMale(dto.countMale())
                            .countFemale(dto.countFemale())
                            .countOther(dto.countOther())
                            .build();
                }).toList();
    }

    // 모임 생존률(현재를 기점으로 한달 내 일정이 있는 활동하는 모임)
    @Transactional(readOnly = true)
    public CircleSurvivalDTO getCircleSurvival() {

        LocalDateTime since = LocalDateTime.now().minusDays(30);

        long total = adminCircleRepository.countTotalCircle();
        long active = adminCircleRepository.countActiveCircle(since);

        double rate = Math.round(active / total * 100) * 100 / 100.0;

        return CircleSurvivalDTO.builder()
                .totalCircle(total)
                .activeCircle(active)
                .survivalRate(rate)
                .build();
    }
}
