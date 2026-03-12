package com.soldesk.moa.admin.dashboard.service;

import com.soldesk.moa.admin.dashboard.repository.AdminCircleMemberRepository;
import com.soldesk.moa.admin.dashboard.repository.AdminPostRepository;
import com.soldesk.moa.admin.dashboard.repository.AdminReplyRepository;
import com.soldesk.moa.admin.dashboard.repository.AdminScheduleRepository;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.querydsl.core.Tuple;
import com.soldesk.moa.admin.dashboard.dto.statistic.ActivityHeatmapDTO;
import com.soldesk.moa.admin.dashboard.dto.statistic.AgeCategoryRetentionDTO;
import com.soldesk.moa.admin.dashboard.dto.statistic.AgeGroupDTO;
import com.soldesk.moa.admin.dashboard.dto.statistic.CircleSurvivalDTO;
import com.soldesk.moa.admin.dashboard.repository.AdminCircleRepository;
import com.soldesk.moa.admin.dashboard.repository.AdminUsersRepository;
import com.soldesk.moa.users.entity.constant.UserGender;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminStatisticsService {

    private final AdminCircleMemberRepository adminCircleMemberRepository;
    private final AdminScheduleRepository adminScheduleRepository;
    private final AdminReplyRepository adminReplyRepository;
    private final AdminPostRepository adminPostRepository;
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

    // 시간대별 활동량 // 에너지테스트 기록 추후 추가
    @Transactional(readOnly = true)
    public List<ActivityHeatmapDTO> getActivityHeatmap() {

        LocalDateTime since = LocalDateTime.now().minusDays(60); // 일주일 간

        Map<String, Long> map = new HashMap<>();

        merge(map, adminUsersRepository.findUserRegisterActivity(since));
        merge(map, adminCircleRepository.findCircleCreateActivity(since));
        merge(map, adminPostRepository.findPostActivity(since));
        merge(map, adminReplyRepository.findReplyActivity(since));
        merge(map, adminScheduleRepository.findScheduleStartActivity(since));

        return map.entrySet().stream()
                .map(e -> {
                    String[] parts = e.getKey().split("_");

                    return ActivityHeatmapDTO.builder()
                            .dayOfweek(Integer.parseInt(parts[0]))
                            .hour(Integer.parseInt(parts[1]))
                            .activityCount(e.getValue())
                            .build();
                }).toList();
    }

    // 각 쿼리를 하나로 합치기 위한 메소드(activityheatmap)
    private void merge(Map<String, Long> map, List<Object[]> objects) {

        for (Object[] objects2 : objects) {
            int day = Integer.parseInt(objects2[0].toString());
            int hour = Integer.parseInt(objects2[1].toString());
            long count = Long.parseLong(objects2[2].toString());

            String key = day + "_" + hour;

            map.put(key, map.getOrDefault(key, 0L) + count);
        }
    }

    // 연령대+카테고리별 모임 유지율
    @Transactional(readOnly = true)
    public List<AgeCategoryRetentionDTO> getAgeCategoryRetention() {
        List<Object[]> rows = adminCircleMemberRepository.getAgeCategoryRetention();

        return rows.stream().map(row -> {
            String ageGroup = row[0].toString();
            String categoryName = row[1].toString();
            long totalMembers = ((Number) row[2]).longValue();
            long retainedMembers = Long.parseLong(row[3].toString());

            double rate = totalMembers == 0 ? 0 : Math.round((retainedMembers * 100.0 / totalMembers) * 100) / 100.0;

            return AgeCategoryRetentionDTO.builder()
                    .ageGroup(ageGroup)
                    .categoryName(categoryName)
                    .totalMembers(totalMembers)
                    .retainedMembers(retainedMembers)
                    .rate(rate)
                    .build();
        }).toList();
    }
}
