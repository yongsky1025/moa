package com.soldesk.moa.place.repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.types.OrderSpecifier;
import com.querydsl.jpa.JPAExpressions;
import com.querydsl.jpa.impl.JPAQueryFactory;
import com.soldesk.moa.place.dto.PlaceSearchDTO;
import com.soldesk.moa.place.entity.Place;
import com.soldesk.moa.place.entity.QPlace;
import com.soldesk.moa.place.entity.QPlaceClosedDay;
import com.soldesk.moa.place.entity.QPlaceTag;
import com.soldesk.moa.place.entity.QReservation;
import com.soldesk.moa.place.entity.constant.PlaceStatus;
import com.soldesk.moa.place.entity.constant.ReservationStatus;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class PlaceSearchRepositoryImpl implements PlaceSearchRepository {

    private final JPAQueryFactory queryFactory;

    @Override
    public List<Place> searchPlaces(PlaceSearchDTO dto) {
        QPlace place = QPlace.place;
        QPlaceTag placeTag = QPlaceTag.placeTag;
        QReservation reservation = QReservation.reservation;
        QPlaceClosedDay closedDay = QPlaceClosedDay.placeClosedDay;

        BooleanBuilder builder = new BooleanBuilder();

        // ACTIVE 장소만 조회
        builder.and(place.status.eq(PlaceStatus.ACTIVE));

        // 키워드 검색 (name, address, description, dong 전체)
        if (dto.keyword() != null && !dto.keyword().isBlank()) {
            String kw = dto.keyword().trim();
            builder.and(
                    place.name.contains(kw)
                            .or(place.address.contains(kw))
                            .or(place.description.contains(kw))
                            .or(place.city.contains(kw))
                            .or(place.district.contains(kw))
                            .or(place.dong.contains(kw)));
        }

        // 지역 필터
        if (dto.city() != null && !dto.city().isBlank()) {
            builder.and(place.city.eq(dto.city()));
        }
        if (dto.district() != null && !dto.district().isBlank()) {
            builder.and(place.district.eq(dto.district()));
        }
        if (dto.dong() != null && !dto.dong().isBlank()) {
            builder.and(place.dong.eq(dto.dong()));
        }

        // 가격 범위 필터
        if (dto.minPrice() != null) {
            builder.and(place.pricePerHour.goe(dto.minPrice()));
        }
        if (dto.maxPrice() != null) {
            builder.and(place.pricePerHour.loe(dto.maxPrice()));
        }

        // 수용인원 범위 필터
        if (dto.minCapacity() != null) {
            builder.and(place.capacity.goe(dto.minCapacity()));
        }
        if (dto.maxCapacity() != null) {
            builder.and(place.capacity.loe(dto.maxCapacity()));
        }

        // 태그 필터 (OR: tagIds 중 하나라도 가진 장소)
        if (dto.tagIds() != null && !dto.tagIds().isEmpty()) {
            builder.and(
                    JPAExpressions.selectOne()
                            .from(placeTag)
                            .where(placeTag.place.id.eq(place.id)
                                    .and(placeTag.tag.id.in(dto.tagIds())))
                            .exists());
        }

        // 예약가능날짜 필터
        if (dto.availableDate() != null && !dto.availableDate().isBlank()) {
            LocalDate date = LocalDate.parse(dto.availableDate());
            LocalDateTime dayStart = date.atStartOfDay();
            LocalDateTime dayEnd = date.plusDays(1).atStartOfDay();

            // 해당 날짜에 HOLDING 또는 RESERVED 예약이 존재하는 장소 제외
            builder.and(
                    JPAExpressions.selectOne()
                            .from(reservation)
                            .where(reservation.place.id.eq(place.id)
                                    .and(reservation.reservationStatus.in(
                                            ReservationStatus.HOLDING,
                                            ReservationStatus.RESERVED))
                                    .and(reservation.startTime.lt(dayEnd))
                                    .and(reservation.endTime.gt(dayStart)))
                            .notExists());

            // 해당 날짜가 특정 휴무일(HOLIDAY)이거나 정기 휴무일(WEEKLY)에 해당하는 장소 제외
            builder.and(
                    JPAExpressions.selectOne()
                            .from(closedDay)
                            .where(closedDay.place.id.eq(place.id)
                                    .and(closedDay.date.eq(date)
                                            .or(closedDay.dayOfWeek.eq(date.getDayOfWeek()))))
                            .notExists());
        }

        // 무한스크롤 커서 (lastId 이후 데이터)
        if (dto.lastId() != null) {
            builder.and(place.id.lt(dto.lastId()));
        }

        // 정렬
        OrderSpecifier<?> orderBy = switch (dto.sort() != null ? dto.sort() : "newest") {
            case "price_asc" -> place.pricePerHour.asc();
            case "price_desc" -> place.pricePerHour.desc();
            case "rating" -> place.averageRating.desc();
            case "reviews" -> place.reviewCount.desc();
            case "capacity" -> place.capacity.desc();
            default -> place.id.desc(); // newest
        };

        return queryFactory
                .selectFrom(place)
                .where(builder)
                .orderBy(orderBy)
                .limit(dto.size())
                .fetch();
    }
}
