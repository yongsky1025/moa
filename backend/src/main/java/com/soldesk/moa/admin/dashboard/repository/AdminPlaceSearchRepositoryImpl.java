package com.soldesk.moa.admin.dashboard.repository;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import com.querydsl.core.Tuple;
import com.querydsl.core.types.OrderSpecifier;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.core.types.dsl.Expressions;
import com.querydsl.core.types.dsl.NumberExpression;
import com.querydsl.jpa.JPAExpressions;
import com.querydsl.jpa.impl.JPAQueryFactory;
import com.soldesk.moa.admin.dashboard.dto.maindashboard.PopularPlaceDTO;
import com.soldesk.moa.admin.dashboard.dto.maindashboard.ReservationCountDTO;
import com.soldesk.moa.admin.dashboard.dto.placeInfo.AdminPlaceSearchDTO;
import com.soldesk.moa.admin.dashboard.dto.statistic.CategoryUsageDTO;
import com.soldesk.moa.admin.dashboard.dto.statistic.CityDistDTO;
import com.soldesk.moa.admin.dashboard.dto.statistic.DistrictDistDTO;
import com.soldesk.moa.admin.dashboard.dto.statistic.PlaceConversionRateDTO;
import com.soldesk.moa.circle.entity.QCircle;
import com.soldesk.moa.circle.entity.QCircleCategory;
import com.soldesk.moa.common.entity.QLikes;
import com.soldesk.moa.common.entity.constant.LikeTargetType;
import com.soldesk.moa.place.entity.Place;
import com.soldesk.moa.place.entity.QPlace;
import com.soldesk.moa.place.entity.QReservation;
import com.soldesk.moa.place.entity.constant.PlaceStatus;
import com.soldesk.moa.place.entity.constant.ReservationStatus;
import com.soldesk.moa.schedule.entity.QSchedule;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class AdminPlaceSearchRepositoryImpl implements AdminPlaceSearchRepository {

    private final JPAQueryFactory queryFactory;

    // ──────────────────────────────────────────────
    // 장소 관리 (검색/페이징)
    // ──────────────────────────────────────────────

    @Override
    public Page<Place> searchAdminPlaces(AdminPlaceSearchDTO searchDTO, Pageable pageable) {
        QPlace place = QPlace.place;

        com.querydsl.core.BooleanBuilder builder = new com.querydsl.core.BooleanBuilder();

        if (searchDTO.getKeyword() != null && !searchDTO.getKeyword().isBlank()) {
            String keyword = searchDTO.getKeyword().trim();
            switch (searchDTO.getType() != null ? searchDTO.getType() : "") {
                case "name" -> builder.and(place.name.contains(keyword));
                case "address" -> builder.and(place.address.contains(keyword));
                case "description" -> builder.and(place.description.contains(keyword));
                default -> builder.and(
                        place.name.contains(keyword)
                                .or(place.address.contains(keyword))
                                .or(place.city.contains(keyword))
                                .or(place.district.contains(keyword)));
            }
        }

        if (searchDTO.getStatus() != null && !searchDTO.getStatus().isBlank()) {
            builder.and(place.status.eq(PlaceStatus.valueOf(searchDTO.getStatus())));
        }
        if (searchDTO.getCity() != null && !searchDTO.getCity().isBlank()) {
            builder.and(place.city.eq(searchDTO.getCity()));
        }
        if (searchDTO.getDistrict() != null && !searchDTO.getDistrict().isBlank()) {
            builder.and(place.district.eq(searchDTO.getDistrict()));
        }
        if (searchDTO.getMinPrice() != null) {
            builder.and(place.pricePerHour.goe(searchDTO.getMinPrice()));
        }
        if (searchDTO.getMaxPrice() != null) {
            builder.and(place.pricePerHour.loe(searchDTO.getMaxPrice()));
        }
        if (searchDTO.getMinCapacity() != null) {
            builder.and(place.capacity.goe(searchDTO.getMinCapacity()));
        }
        if (searchDTO.getMaxCapacity() != null) {
            builder.and(place.capacity.loe(searchDTO.getMaxCapacity()));
        }

        OrderSpecifier<?> orderBy = switch (searchDTO.getSort() != null ? searchDTO.getSort() : "newest") {
            case "name" -> place.name.asc();
            case "capacity" -> place.capacity.desc();
            case "price" -> place.pricePerHour.desc();
            case "rating" -> place.averageRating.desc();
            case "reviews" -> place.reviewCount.desc();
            default -> place.id.desc();
        };

        List<Place> content = queryFactory.selectFrom(place)
                .where(builder).orderBy(orderBy)
                .offset(pageable.getOffset()).limit(pageable.getPageSize()).fetch();

        Long total = queryFactory.select(place.count()).from(place).where(builder).fetchOne();
        return new PageImpl<>(content, pageable, total == null ? 0L : total);
    }

    // ──────────────────────────────────────────────
    // 대시보드 통계 (3개)
    // ──────────────────────────────────────────────

    /**
     * 오늘/이번주 예약수 + 증감률
     * 기준: RESERVED + COMPLETED, createDate 기준
     */
    @Override
    public ReservationCountDTO getReservationCounts() {
        QReservation reservation = QReservation.reservation;

        LocalDateTime todayStart = LocalDate.now().atStartOfDay();
        LocalDateTime yesterdayStart = todayStart.minusDays(1);
        LocalDateTime weekStart = LocalDate.now()
                .with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY)).atStartOfDay();
        LocalDateTime lastWeekStart = weekStart.minusWeeks(1);

        long today = countByPeriod(reservation, todayStart, null);
        long yesterday = countByPeriod(reservation, yesterdayStart, todayStart);
        long week = countByPeriod(reservation, weekStart, null);
        long lastWeek = countByPeriod(reservation, lastWeekStart, weekStart);

        return new ReservationCountDTO(
                today, yesterday, changeRate(today, yesterday),
                week, lastWeek, changeRate(week, lastWeek));
    }

    /** createDate 범위 + RESERVED/COMPLETED 상태 예약수 */
    private long countByPeriod(QReservation reservation, LocalDateTime from, LocalDateTime to) {
        BooleanExpression cond = reservation.createDate.goe(from)
                .and(reservation.reservationStatus.in(
                        ReservationStatus.RESERVED, ReservationStatus.COMPLETED));
        if (to != null) {
            cond = cond.and(reservation.createDate.lt(to));
        }
        Long result = queryFactory.select(reservation.count()).from(reservation).where(cond).fetchOne();
        return result != null ? result : 0L;
    }

    /** 증감률: (current - previous) / previous × 100, 소수점 1자리 */
    private double changeRate(long current, long previous) {
        if (previous == 0)
            return current > 0 ? 100.0 : 0.0;
        return Math.round((double) (current - previous) / previous * 1000.0) / 10.0;
    }

    /**
     * 인기장소 top5 (최근 30일 기준)
     * score = 최근30일예약수×0.4 + (평점×20)×0.3 + 최근30일좋아요수×0.3
     * 평점 0~5를 ×20 하여 0~100 스케일로 정규화
     */
    @Override
    public List<PopularPlaceDTO> findTop5PopularPlaces(LocalDateTime since) {
        QPlace place = QPlace.place;
        QReservation reservation = QReservation.reservation;
        QLikes likes = QLikes.likes;

        // 최근 30일 예약수 (서브쿼리)
        NumberExpression<Long> recentResCnt = Expressions.numberTemplate(Long.class, "{0}",
                JPAExpressions.select(reservation.count()).from(reservation)
                        .where(reservation.place.eq(place),
                                reservation.createDate.goe(since),
                                reservation.reservationStatus.in(
                                        ReservationStatus.RESERVED, ReservationStatus.COMPLETED)));

        // 최근 30일 좋아요수 (서브쿼리) — Likes는 targetType+targetId 패턴
        NumberExpression<Long> recentLikeCnt = Expressions.numberTemplate(Long.class, "{0}",
                JPAExpressions.select(likes.count()).from(likes)
                        .where(likes.targetType.eq(LikeTargetType.PLACE),
                                likes.targetId.eq(place.id),
                                likes.createDate.goe(since)));

        // 점수 계산
        NumberExpression<Double> score = recentResCnt.doubleValue().multiply(0.4)
                .add(place.averageRating.multiply(20.0).multiply(0.3))
                .add(recentLikeCnt.doubleValue().multiply(0.3));

        List<Tuple> rows = queryFactory
                .select(place.id, place.name, place.city,
                        score, place.averageRating,
                        recentResCnt, recentLikeCnt)
                .from(place)
                .where(place.status.eq(PlaceStatus.ACTIVE))
                .orderBy(score.desc())
                .limit(5)
                .fetch();

        return rows.stream().map(t -> new PopularPlaceDTO(
                t.get(0, Long.class),
                t.get(1, String.class),
                t.get(2, String.class),
                Optional.ofNullable(t.get(3, Double.class)).orElse(0.0),
                Optional.ofNullable(t.get(4, Double.class)).orElse(0.0),
                Optional.ofNullable(t.get(5, Long.class)).orElse(0L),
                Optional.ofNullable(t.get(6, Long.class)).orElse(0L))).toList();
    }

    /**
     * 장소 이용률 (최근 30일 기준)
     * 분자: 최근 30일 RESERVED+COMPLETED 예약 총 이용분
     * 분모: ACTIVE 장소 일일 영업분 합 × 30일
     */
    @Override
    public Double calculateUtilizationRate(LocalDateTime since) {
        QPlace place = QPlace.place;
        QReservation reservation = QReservation.reservation;

        // 분자: 실제 이용 분
        Long reservedMin = queryFactory
                .select(Expressions.numberTemplate(Long.class,
                        "SUM(TIMESTAMPDIFF(MINUTE, {0}, {1}))",
                        reservation.startTime, reservation.endTime))
                .from(reservation)
                .where(reservation.createDate.goe(since),
                        reservation.reservationStatus.in(
                                ReservationStatus.RESERVED, ReservationStatus.COMPLETED))
                .fetchOne();

        // 분모: ACTIVE 장소의 하루 영업분 합 × 30
        Long dailyCapacityMin = queryFactory
                .select(Expressions.numberTemplate(Long.class,
                        "SUM(TIMESTAMPDIFF(MINUTE, {0}, {1}))",
                        place.openTime, place.closeTime))
                .from(place)
                .where(place.status.eq(PlaceStatus.ACTIVE))
                .fetchOne();

        if (dailyCapacityMin == null || dailyCapacityMin == 0L)
            return 0.0;

        long totalCapacity = dailyCapacityMin * 30L;
        double rate = (double) (reservedMin != null ? reservedMin : 0L) / totalCapacity * 100.0;
        return Math.round(rate * 10.0) / 10.0;
    }

    // ──────────────────────────────────────────────
    // 통계 리포트 (4개)
    // ──────────────────────────────────────────────

    /**
     * 일정-장소 연계율 (전체 누적)
     * 장소 예약(RESERVED+COMPLETED)이 연결된 고유 Schedule수 ÷ 전체 Schedule수
     * schedule == null인 개인 직접 예약은 연계율 분자에 포함 안 함
     */
    @Override
    public PlaceConversionRateDTO calculateConversionRate() {
        QReservation reservation = QReservation.reservation;
        QSchedule schedule = QSchedule.schedule;

        long total = Optional.ofNullable(
                queryFactory.select(schedule.count()).from(schedule).fetchOne()).orElse(0L);

        long linked = Optional.ofNullable(
                queryFactory.select(reservation.schedule.scheduleId.countDistinct())
                        .from(reservation)
                        .where(reservation.schedule.isNotNull(),
                                reservation.reservationStatus.in(
                                        ReservationStatus.RESERVED, ReservationStatus.COMPLETED))
                        .fetchOne())
                .orElse(0L);

        double rate = total == 0 ? 0.0 : Math.round((double) linked / total * 1000.0) / 10.0;
        return new PlaceConversionRateDTO(rate, linked, total);
    }

    /**
     * 시/도 레벨 장소 이용 분포 (최근 30일 기준)
     * percentage: 최근 30일 전체 예약 대비 해당 시/도 비율
     */
    @Override
    public List<CityDistDTO> getCityDistribution() {
        QPlace place = QPlace.place;
        QReservation reservation = QReservation.reservation;

        LocalDateTime since30 = LocalDateTime.now().minusDays(30);

        List<Tuple> raw = queryFactory
                .select(place.city, reservation.count())
                .from(reservation)
                .join(reservation.place, place)
                .where(reservation.createDate.goe(since30),
                        reservation.reservationStatus.in(
                                ReservationStatus.RESERVED, ReservationStatus.COMPLETED))
                .groupBy(place.city)
                .orderBy(reservation.count().desc())
                .fetch();

        long total = raw.stream()
                .mapToLong(t -> Optional.ofNullable(t.get(1, Long.class)).orElse(0L))
                .sum();

        return raw.stream().map(t -> {
            String city = t.get(0, String.class);
            long cnt = Optional.ofNullable(t.get(1, Long.class)).orElse(0L);
            double pct = total == 0 ? 0.0 : Math.round((double) cnt / total * 1000.0) / 10.0;
            return new CityDistDTO(city, cnt, pct);
        }).toList();
    }

    /**
     * 구/군 레벨 드릴다운 + 전기간 대비 증감률
     * percentage: 해당 시/도 내 구/군 비율
     * monthOverMonthChange: (최근 30일 - 이전 30일) / 이전 30일 × 100
     */
    @Override
    public List<DistrictDistDTO> getDistrictDistribution(String city) {
        QPlace place = QPlace.place;
        QReservation reservation = QReservation.reservation;

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime since30 = now.minusDays(30);  // 최근 30일 시작
        LocalDateTime since60 = now.minusDays(60);  // 이전 30일 시작

        // 최근 30일 구/군별 예약수
        Map<String, Long> thisMonth = queryFactory
                .select(place.district, reservation.count())
                .from(reservation)
                .join(reservation.place, place)
                .where(place.city.eq(city),
                        reservation.createDate.goe(since30),
                        reservation.reservationStatus.in(
                                ReservationStatus.RESERVED, ReservationStatus.COMPLETED))
                .groupBy(place.district)
                .fetch()
                .stream()
                .collect(Collectors.toMap(
                        t -> t.get(0, String.class),
                        t -> Optional.ofNullable(t.get(1, Long.class)).orElse(0L)));

        // 이전 30일(30~60일 전) 구/군별 예약수
        Map<String, Long> lastMonth = queryFactory
                .select(place.district, reservation.count())
                .from(reservation)
                .join(reservation.place, place)
                .where(place.city.eq(city),
                        reservation.createDate.goe(since60),
                        reservation.createDate.lt(since30),
                        reservation.reservationStatus.in(
                                ReservationStatus.RESERVED, ReservationStatus.COMPLETED))
                .groupBy(place.district)
                .fetch()
                .stream()
                .collect(Collectors.toMap(
                        t -> t.get(0, String.class),
                        t -> Optional.ofNullable(t.get(1, Long.class)).orElse(0L)));

        long districtTotal = thisMonth.values().stream().mapToLong(Long::longValue).sum();

        return thisMonth.entrySet().stream().map(e -> {
            String district = e.getKey();
            long cnt = e.getValue();
            long prev = lastMonth.getOrDefault(district, 0L);
            double pct = districtTotal == 0 ? 0.0
                    : Math.round((double) cnt / districtTotal * 1000.0) / 10.0;
            double mom = changeRate(cnt, prev);
            return new DistrictDistDTO(city, district, cnt, pct, mom);
        }).sorted((a, b) -> Long.compare(b.count(), a.count())).toList();
    }

    /**
     * 모임 카테고리 × 장소 예약 건수 + 전체 대비 비율
     * schedule == null인 개인 직접 예약 제외 (INNER JOIN on schedule)
     */
    @Override
    public List<CategoryUsageDTO> getCategoryUsageStats() {
        QReservation reservation = QReservation.reservation;
        QSchedule schedule = QSchedule.schedule;
        QCircle circle = QCircle.circle;
        QCircleCategory category = QCircleCategory.circleCategory;

        List<Tuple> raw = queryFactory
                .select(category.categoryName, reservation.count())
                .from(reservation)
                .join(reservation.schedule, schedule) // INNER JOIN: schedule 없는 예약 제외
                .join(schedule.circle, circle)
                .join(circle.category, category)
                .where(reservation.reservationStatus.in(
                        ReservationStatus.RESERVED, ReservationStatus.COMPLETED))
                .groupBy(category.categoryName)
                .orderBy(reservation.count().desc())
                .fetch();

        long total = raw.stream()
                .mapToLong(t -> Optional.ofNullable(t.get(1, Long.class)).orElse(0L))
                .sum();

        return raw.stream().map(t -> {
            String name = t.get(0, String.class);
            long cnt = Optional.ofNullable(t.get(1, Long.class)).orElse(0L);
            double pct = total == 0 ? 0.0 : Math.round((double) cnt / total * 1000.0) / 10.0;
            return new CategoryUsageDTO(name, cnt, pct);
        }).toList();
    }
}
