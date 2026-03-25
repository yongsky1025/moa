package com.soldesk.moa.place.service;

import java.util.Comparator;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.soldesk.moa.admin.dashboard.repository.AdminUsersRepository;
import com.soldesk.moa.common.entity.Likes;
import com.soldesk.moa.common.entity.constant.LikeTargetType;
import com.soldesk.moa.common.repository.LikesRepository;
import com.soldesk.moa.place.dto.NearbyPlaceResponseDTO;
import com.soldesk.moa.place.dto.PlaceClosedDayDTO;
import com.soldesk.moa.place.dto.PlaceDetailResponseDTO;
import com.soldesk.moa.place.dto.PlaceLikiResponseDTO;
import com.soldesk.moa.place.dto.PlaceListResponseDTO;
import com.soldesk.moa.place.dto.PlaceResponseDTO;
import com.soldesk.moa.place.dto.PlaceReviewDTO;
import com.soldesk.moa.place.dto.PlaceSearchDTO;
import com.soldesk.moa.place.dto.TagResponseDTO;
import com.soldesk.moa.place.entity.Place;
import com.soldesk.moa.place.repository.PlaceRepository;
import com.soldesk.moa.place.repository.PlaceReviewRepository;
import com.soldesk.moa.users.entity.Users;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Service
@Transactional
@RequiredArgsConstructor
@Log4j2
public class PlaceService {

        private final PlaceRepository placeRepository;
        private final LikesRepository likesRepository;
        private final AdminUsersRepository usersRepository;
        private final PlaceReviewRepository placeReviewRepository;
        private final PlaceImageService placeImageService;

        // 장소 단건 상세 조회
        @Transactional(readOnly = true)
        public PlaceDetailResponseDTO getPlace(Long id) {

                Place place = placeRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("place not found"));

                List<TagResponseDTO> tags = place.getTags().stream()
                                .map(pt -> TagResponseDTO.builder()
                                                .id(pt.getTag().getId())
                                                .name(pt.getTag().getName())
                                                .build())
                                .toList();

                List<PlaceClosedDayDTO> closedDays = place.getPlaceClosedDays().stream()
                                .map(cd -> PlaceClosedDayDTO.builder()
                                                .dayOfWeek(cd.getDayOfWeek())
                                                .date(cd.getDate())
                                                .reason(cd.getReason())
                                                .closedType(cd.getClosedType().name())
                                                .build())
                                .toList();

                List<String> images = placeImageService.getPlaceImages(id);
                String representativeImage = images.isEmpty() ? null : images.get(0);

                long likeCount = likesRepository.countByTargetTypeAndTargetId(
                                com.soldesk.moa.common.entity.constant.LikeTargetType.PLACE, id);

                String openTime = place.getOpenTime() != null
                                ? place.getOpenTime().toString()
                                : null;
                String closeTime = place.getCloseTime() != null
                                ? place.getCloseTime().toString()
                                : null;

                return PlaceDetailResponseDTO.builder()
                                .id(place.getId())
                                .name(place.getName())
                                .address(place.getAddress())
                                .city(place.getCity())
                                .district(place.getDistrict())
                                .dong(place.getDong())
                                .latitude(place.getLatitude())
                                .longitude(place.getLongitude())
                                .capacity(place.getCapacity())
                                .pricePerHour(place.getPricePerHour())
                                .avgRating(place.getAverageRating() != null ? place.getAverageRating() : 0.0)
                                .reviewCount(place.getReviewCount() != null ? place.getReviewCount() : 0)
                                .representativeImagePath(representativeImage)
                                .description(place.getDescription())
                                .minReservationMinutes(place.getMinReservationMinutes())
                                .maxReservationMinutes(place.getMaxReservationMinutes())
                                .openTime(openTime)
                                .closeTime(closeTime)
                                .tags(tags)
                                .closedDays(closedDays)
                                .images(images)
                                .likeCount(likeCount)
                                .build();
        }

        // 장소 리뷰 목록 조회
        @Transactional(readOnly = true)
        public List<PlaceReviewDTO> getPlaceReviews(Long id) {
                return placeReviewRepository.findByPlaceIdOrderByIdDesc(id).stream()
                                .map(r -> PlaceReviewDTO.builder()
                                                .id(r.getId())
                                                .rating(r.getRating())
                                                .comment(r.getComment())
                                                .reviewerNickname(r.getReviewer().getNickname())
                                                .build())
                                .toList();
        }

        // 장소 목록 검색/필터 (무한스크롤)
        @Transactional(readOnly = true)
        public PlaceListResponseDTO searchPlaces(PlaceSearchDTO searchDTO) {

                List<Place> places = placeRepository.searchPlaces(searchDTO);

                List<PlaceResponseDTO> dtoList = places.stream()
                                .map(place -> PlaceResponseDTO.builder()
                                                .id(place.getId())
                                                .name(place.getName())
                                                .address(place.getAddress())
                                                .city(place.getCity())
                                                .district(place.getDistrict())
                                                .dong(place.getDong())
                                                .latitude(place.getLatitude())
                                                .longitude(place.getLongitude())
                                                .capacity(place.getCapacity())
                                                .pricePerHour(place.getPricePerHour())
                                                .avgRating(place.getAverageRating() != null ? place.getAverageRating()
                                                                : 0.0)
                                                .reviewCount(place.getReviewCount() != null ? place.getReviewCount()
                                                                : 0)
                                                .build())
                                .toList();

                boolean hasNext = places.size() == searchDTO.size();
                Long lastId = places.isEmpty() ? null : places.get(places.size() - 1).getId();

                return new PlaceListResponseDTO(dtoList, hasNext, lastId);
        }

        // 장소 좋아요 메소드
        public PlaceLikiResponseDTO toggle(Long userId, LikeTargetType targetType, Long targetId) {
                Users user = usersRepository.findById(userId)
                                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 유저입니다."));

                boolean isLiked;

                if (likesRepository.existsByUserAndTargetTypeAndTargetId(user, targetType, targetId)) {
                        likesRepository.deleteByUserAndTargetTypeAndTargetId(user, targetType, targetId);
                        isLiked = false;
                } else {
                        likesRepository.save(Likes.builder()
                                        .user(user)
                                        .targetType(targetType)
                                        .targetId(targetId)
                                        .build());
                        isLiked = true;
                }

                long likeCount = likesRepository.countByTargetTypeAndTargetId(targetType, targetId);

                return PlaceLikiResponseDTO.builder()
                                .targetType(targetType)
                                .targetId(targetId)
                                .liked(isLiked)
                                .likeCount(likeCount)
                                .build();

        }

        // 근처 장소 추천 (Haversine 거리 기반)
        @Transactional(readOnly = true)
        public List<NearbyPlaceResponseDTO> getNearbyPlaces(double lat, double lng, double radiusKm) {
                return placeRepository.findAll().stream()
                                .map(p -> {
                                        double dist = haversineDistance(lat, lng, p.getLatitude(), p.getLongitude());
                                        return new NearbyPlaceResponseDTO(
                                                        p.getId(), p.getName(), p.getAddress(),
                                                        p.getCity(), p.getDistrict(),
                                                        p.getLatitude(), p.getLongitude(),
                                                        p.getCapacity(), p.getPricePerHour(),
                                                        Math.round(dist * 100.0) / 100.0);
                                })
                                .filter(p -> p.distanceKm() <= radiusKm)
                                .sorted(Comparator.comparingDouble(NearbyPlaceResponseDTO::distanceKm))
                                .limit(10)
                                .toList();
        }

        private double haversineDistance(double lat1, double lng1, double lat2, double lng2) {
                double R = 6371;
                double dLat = Math.toRadians(lat2 - lat1);
                double dLng = Math.toRadians(lng2 - lng1);
                double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                                                * Math.sin(dLng / 2) * Math.sin(dLng / 2);
                return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        }
}
