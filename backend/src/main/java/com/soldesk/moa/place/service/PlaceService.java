package com.soldesk.moa.place.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Stream;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.soldesk.moa.payment.dto.OccupiedSlotDTO;
import com.soldesk.moa.place.repository.PlaceReviewRepository;
import com.soldesk.moa.place.repository.ReservationRepository;

import com.soldesk.moa.admin.dashboard.repository.AdminUsersRepository;
import com.soldesk.moa.common.entity.Likes;
import com.soldesk.moa.common.entity.constant.LikeTargetType;
import com.soldesk.moa.common.repository.LikesRepository;
import com.soldesk.moa.place.dto.MyLikedPlaceDTO;
import com.soldesk.moa.place.dto.MyUsedPlaceDTO;
import com.soldesk.moa.place.dto.PlaceCreateDTO;
import com.soldesk.moa.place.dto.PlaceClosedDayDTO;
import com.soldesk.moa.place.dto.PlaceDetailResponseDTO;
import com.soldesk.moa.place.dto.PlaceLikiResponseDTO;
import com.soldesk.moa.place.dto.PlaceListResponseDTO;
import com.soldesk.moa.place.dto.PlaceResponseDTO;
import com.soldesk.moa.place.dto.PlaceSearchDTO;
import com.soldesk.moa.place.dto.TagResponseDTO;
import com.soldesk.moa.place.entity.Place;
import com.soldesk.moa.place.entity.Reservation;
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
        private final PlaceImageService placeImageService;
        private final ReservationRepository reservationRepository;
        private final PlaceReviewRepository placeReviewRepository;

        // 장소 단건 상세 조회
        @Transactional(readOnly = true)
        public PlaceDetailResponseDTO getPlace(Long id, Long userId) {

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

                boolean liked = userId != null && usersRepository.findById(userId)
                                .map(user -> likesRepository.existsByUserAndTargetTypeAndTargetId(
                                                user, LikeTargetType.PLACE, id))
                                .orElse(false);

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
                                .liked(liked)
                                .build();
        }

        // 장소 목록 검색/필터 (무한스크롤)
        @Transactional(readOnly = true)
        public PlaceListResponseDTO searchPlaces(PlaceSearchDTO searchDTO, Long userId) {

                List<Place> places = placeRepository.searchPlaces(searchDTO);

                List<Long> placeIds = places.stream().map(Place::getId).toList();
                Map<Long, String> repImages = placeImageService.getRepresentativeImages(placeIds);

                java.util.Set<Long> likedIds = java.util.Set.of();
                if (userId != null) {
                        likedIds = usersRepository.findById(userId)
                                        .map(user -> likesRepository.findByUserAndTargetType(user, LikeTargetType.PLACE)
                                                        .stream()
                                                        .map(com.soldesk.moa.common.entity.Likes::getTargetId)
                                                        .collect(java.util.stream.Collectors.toSet()))
                                        .orElse(java.util.Set.of());
                }
                final java.util.Set<Long> finalLikedIds = likedIds;

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
                                                .representativeImagePath(repImages.get(place.getId()))
                                                .minReservationMinutes(place.getMinReservationMinutes())
                                                .liked(finalLikedIds.contains(place.getId()))
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

        // 날짜별 예약된(점유된) 시간대 조회
        @Transactional(readOnly = true)
        public List<OccupiedSlotDTO> getOccupiedSlots(Long placeId, LocalDate date) {
                return reservationRepository.findOccupiedSlots(placeId, date)
                                .stream()
                                .map(r -> new OccupiedSlotDTO(
                                                r.getStartTime().toLocalTime().toString(),
                                                r.getEndTime().toLocalTime().toString()))
                                .toList();
        }

        // 내가 찜한 장소 목록
        @Transactional(readOnly = true)
        public List<MyLikedPlaceDTO> getMyLikedPlaces(Long userId) {
                Users user = usersRepository.findById(userId)
                                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 유저입니다."));

                List<Long> likedPlaceIds = likesRepository.findByUserAndTargetType(user, LikeTargetType.PLACE)
                                .stream()
                                .map(Likes::getTargetId)
                                .toList();

                if (likedPlaceIds.isEmpty()) return List.of();

                List<Place> places = placeRepository.findByIdsWithTags(likedPlaceIds);
                Map<Long, String> repImages = placeImageService.getRepresentativeImages(likedPlaceIds);

                return places.stream()
                                .map(p -> new MyLikedPlaceDTO(
                                                p.getId(),
                                                p.getName(),
                                                p.getCity(),
                                                p.getDistrict(),
                                                p.getCapacity(),
                                                p.getAverageRating() != null ? p.getAverageRating() : 0.0,
                                                p.getReviewCount() != null ? p.getReviewCount() : 0,
                                                p.getPricePerHour(),
                                                repImages.get(p.getId()),
                                                p.getTags().stream()
                                                                .map(pt -> pt.getTag().getName())
                                                                .limit(5)
                                                                .toList()))
                                .toList();
        }

        // 내가 이용한 장소 목록 (직접 예약 COMPLETED + 일정 멤버 참여 COMPLETED)
        @Transactional(readOnly = true)
        public List<MyUsedPlaceDTO> getMyUsedPlaces(Long userId) {
                List<Reservation> direct = reservationRepository.findMyDirectCompletedReservations(userId);
                List<Reservation> schedule = reservationRepository.findMyScheduleCompletedReservations(userId);

                List<Long> allReservationIds = Stream.concat(
                                direct.stream().map(Reservation::getId),
                                schedule.stream().map(Reservation::getId))
                                .toList();

                Set<Long> reviewedIds = allReservationIds.isEmpty()
                                ? Set.of()
                                : placeReviewRepository.findReviewedReservationIds(userId, allReservationIds);

                List<Long> placeIds = Stream.concat(
                                direct.stream().map(r -> r.getPlace().getId()),
                                schedule.stream().map(r -> r.getPlace().getId()))
                                .distinct()
                                .toList();

                Map<Long, String> repImages = placeImageService.getRepresentativeImages(placeIds);

                List<MyUsedPlaceDTO> result = new ArrayList<>();

                direct.stream()
                                .map(r -> new MyUsedPlaceDTO(
                                                r.getId(),
                                                r.getPlace().getId(),
                                                r.getPlace().getName(),
                                                r.getStartTime(),
                                                r.getEndTime(),
                                                r.getTotalPrice(),
                                                repImages.get(r.getPlace().getId()),
                                                "DIRECT",
                                                reviewedIds.contains(r.getId())))
                                .forEach(result::add);

                schedule.stream()
                                .map(r -> new MyUsedPlaceDTO(
                                                r.getId(),
                                                r.getPlace().getId(),
                                                r.getPlace().getName(),
                                                r.getStartTime(),
                                                r.getEndTime(),
                                                r.getTotalPrice(),
                                                repImages.get(r.getPlace().getId()),
                                                "SCHEDULE",
                                                reviewedIds.contains(r.getId())))
                                .forEach(result::add);

                result.sort(Comparator.comparing(MyUsedPlaceDTO::startTime).reversed());
                return result;
        }

}
