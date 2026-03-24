package com.soldesk.moa.admin.dashboard.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.types.OrderSpecifier;
import com.querydsl.jpa.impl.JPAQueryFactory;
import com.soldesk.moa.admin.dashboard.dto.placeInfo.AdminPlaceSearchDTO;
import com.soldesk.moa.place.entity.Place;
import com.soldesk.moa.place.entity.QPlace;
import com.soldesk.moa.place.entity.constant.PlaceStatus;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class AdminPlaceSearchRepositoryImpl implements AdminPlaceSearchRepository {

    private final JPAQueryFactory queryFactory;

    @Override
    public Page<Place> searchAdminPlaces(AdminPlaceSearchDTO searchDTO, Pageable pageable) {
        QPlace place = QPlace.place;

        BooleanBuilder builder = new BooleanBuilder();

        // 키워드 검색 (type: name, address, description / 기본: 전체)
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

        // 상태 필터
        if (searchDTO.getStatus() != null && !searchDTO.getStatus().isBlank()) {
            builder.and(place.status.eq(PlaceStatus.valueOf(searchDTO.getStatus())));
        }

        // 지역 필터
        if (searchDTO.getCity() != null && !searchDTO.getCity().isBlank()) {
            builder.and(place.city.eq(searchDTO.getCity()));
        }
        if (searchDTO.getDistrict() != null && !searchDTO.getDistrict().isBlank()) {
            builder.and(place.district.eq(searchDTO.getDistrict()));
        }

        // 가격 범위 필터
        if (searchDTO.getMinPrice() != null) {
            builder.and(place.pricePerHour.goe(searchDTO.getMinPrice()));
        }
        if (searchDTO.getMaxPrice() != null) {
            builder.and(place.pricePerHour.loe(searchDTO.getMaxPrice()));
        }

        // 수용인원 범위 필터
        if (searchDTO.getMinCapacity() != null) {
            builder.and(place.capacity.goe(searchDTO.getMinCapacity()));
        }
        if (searchDTO.getMaxCapacity() != null) {
            builder.and(place.capacity.loe(searchDTO.getMaxCapacity()));
        }

        // 정렬
        OrderSpecifier<?> orderBy = switch (searchDTO.getSort() != null ? searchDTO.getSort() : "newest") {
            case "name" -> place.name.asc();
            case "capacity" -> place.capacity.desc();
            case "price" -> place.pricePerHour.desc();
            case "rating" -> place.averageRating.desc();
            case "reviews" -> place.reviewCount.desc();
            default -> place.id.desc(); // newest
        };

        // 데이터 조회
        List<Place> content = queryFactory
                .selectFrom(place)
                .where(builder)
                .orderBy(orderBy)
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize())
                .fetch();

        // 총 개수
        Long total = queryFactory
                .select(place.count())
                .from(place)
                .where(builder)
                .fetchOne();

        return new PageImpl<>(content, pageable, total == null ? 0L : total);
    }
}
