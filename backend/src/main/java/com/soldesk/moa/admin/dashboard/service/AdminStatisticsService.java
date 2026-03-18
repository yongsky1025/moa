package com.soldesk.moa.admin.dashboard.service;

import com.soldesk.moa.admin.dashboard.repository.AdminCircleMemberRepository;
import com.soldesk.moa.admin.dashboard.repository.AdminPostRepository;
import com.soldesk.moa.admin.dashboard.repository.AdminReplyRepository;
import com.soldesk.moa.admin.dashboard.repository.AdminScheduleRepository;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
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

    // 모임 생존률
    // 활성 = 신생모임(30일 미만) + 성숙모임(30일 이상) 중 최근 30일 내 일정 있음
    // 비활성 = 성숙모임 중 최근 30일 내 일정 없음
    // 생존률 = (전체 - 비활성) / 전체
    @Transactional(readOnly = true)
    public CircleSurvivalDTO getCircleSurvival() {

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime monthAgo = now.minusDays(30);

        long total = adminCircleRepository.countTotalCircle();
        long inactiveMature = adminCircleRepository.countInactiveMatureCircle(monthAgo, monthAgo);
        long active = total - inactiveMature;

        double rate = total == 0 ? 0.0 : Math.round((double) active / total * 10000.0) / 100.0;

        return CircleSurvivalDTO.builder()
                .totalCircle(total)
                .activeCircle(active)
                .survivalRate(rate)
                .build();
    }

    // 시간대별 활동량 (활동 유형별 분리) // 에너지테스트 활동도 추후 추가
    @Transactional(readOnly = true)
    public List<ActivityHeatmapDTO> getActivityHeatmap() {

        LocalDateTime since = LocalDateTime.now().minusDays(7);

        Map<String, Long> userMap = new HashMap<>();
        Map<String, Long> circleMap = new HashMap<>();
        Map<String, Long> postMap = new HashMap<>();
        Map<String, Long> replyMap = new HashMap<>();
        Map<String, Long> scheduleMap = new HashMap<>();

        merge(userMap, adminUsersRepository.findUserRegisterActivity(since));
        merge(circleMap, adminCircleRepository.findCircleCreateActivity(since));
        merge(postMap, adminPostRepository.findPostActivity(since));
        merge(replyMap, adminReplyRepository.findReplyActivity(since));
        merge(scheduleMap, adminScheduleRepository.findScheduleStartActivity(since));

        Set<String> allKeys = new HashSet<>();
        allKeys.addAll(userMap.keySet());
        allKeys.addAll(circleMap.keySet());
        allKeys.addAll(postMap.keySet());
        allKeys.addAll(replyMap.keySet());
        allKeys.addAll(scheduleMap.keySet());

        return allKeys.stream()
                .map(key -> {
                    String[] parts = key.split("_");
                    long user = userMap.getOrDefault(key, 0L);
                    long circle = circleMap.getOrDefault(key, 0L);
                    long post = postMap.getOrDefault(key, 0L);
                    long reply = replyMap.getOrDefault(key, 0L);
                    long schedule = scheduleMap.getOrDefault(key, 0L);

                    return ActivityHeatmapDTO.builder()
                            .dayOfweek(Integer.parseInt(parts[0]))
                            .hour(Integer.parseInt(parts[1]))
                            .activityCount(user + circle + post + reply + schedule)
                            .userRegisterCount(user)
                            .circleCreateCount(circle)
                            .postCount(post)
                            .replyCount(reply)
                            .scheduleCount(schedule)
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
