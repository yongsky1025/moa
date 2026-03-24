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
import com.soldesk.moa.place.dto.PlaceCreateDTO;
import com.soldesk.moa.place.dto.PlaceLikiResponseDTO;
import com.soldesk.moa.place.dto.PlaceResponseDTO;
import com.soldesk.moa.place.entity.Place;
import com.soldesk.moa.place.repository.PlaceRepository;
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

        // 장소 조회(하나)
        @Transactional(readOnly = true)
        public PlaceResponseDTO getPlace(Long id) {

                Place place = placeRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("place not found"));

                return PlaceResponseDTO.builder()
                                .id(place.getId())
                                .name(place.getName())
                                .address(place.getAddress())
                                .city(place.getCity())
                                .district(place.getDistrict())
                                .capacity(place.getCapacity())
                                .pricePerHour(place.getPricePerHour())
                                .build();
        }

        // 장소 전체 조회 (사용자용 카드 리스트)
        @Transactional(readOnly = true)
        public List<PlaceResponseDTO> getAllPlaces() {

                return placeRepository.findAll()
                                .stream()
                                .map(place -> PlaceResponseDTO.builder()
                                                .id(place.getId())
                                                .name(place.getName())
                                                .address(place.getAddress())
                                                .city(place.getCity())
                                                .district(place.getDistrict())
                                                .capacity(place.getCapacity())
                                                .pricePerHour(place.getPricePerHour())
                                                .avgRating(place.getAverageRating() != null ? place.getAverageRating()
                                                                : 0.0)
                                                .reviewCount(place.getReviewCount() != null ? place.getReviewCount()
                                                                : 0)
                                                .build())
                                .toList();
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

        // 수정(변경가능성o) , 태그 및 기타 수정은 나중에...
        public Long updatePlace(Long id, PlaceCreateDTO dto) {
                Place place = placeRepository.findById(id).orElseThrow(() -> new RuntimeException("place not found"));

                place.setAddress(dto.address());
                place.setCapacity(dto.capacity());
                place.setCity(dto.city());
                place.setDescription(dto.description());
                place.setDistrict(dto.district());
                place.setName(dto.name());
                place.setPricePerHour(dto.pricePerHour());

                return place.getId();
        }

        // 삭제
        public void deletePlace(Long id) {
                placeRepository.deleteById(id);
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
