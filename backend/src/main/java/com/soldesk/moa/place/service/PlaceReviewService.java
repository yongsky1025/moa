package com.soldesk.moa.place.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.soldesk.moa.admin.dashboard.repository.AdminUsersRepository;
import com.soldesk.moa.common.entity.constant.ImageDomain;
import com.soldesk.moa.common.entity.constant.ImageStatus;
import com.soldesk.moa.place.dto.MyPlaceReviewDTO;
import com.soldesk.moa.place.dto.PendingReviewDTO;
import com.soldesk.moa.place.dto.PlaceReviewCreateDTO;
import com.soldesk.moa.place.dto.PlaceReviewDetailDTO;
import com.soldesk.moa.place.dto.PlaceReviewUpdateDTO;
import com.soldesk.moa.place.entity.Place;
import com.soldesk.moa.place.entity.PlaceReview;
import com.soldesk.moa.place.entity.Reservation;
import com.soldesk.moa.place.entity.constant.ReservationStatus;
import com.soldesk.moa.place.repository.PlaceImageRepository;
import com.soldesk.moa.place.repository.PlaceReviewRepository;
import com.soldesk.moa.place.repository.ReservationRepository;
import com.soldesk.moa.schedule.entity.constant.ScheduleMemberStatus;
import com.soldesk.moa.schedule.repository.ScheduleMemberRepository;
import com.soldesk.moa.users.entity.Users;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Service
@Transactional
@RequiredArgsConstructor
@Log4j2
public class PlaceReviewService {

    private static final int REVIEW_DEADLINE_DAYS = 30;
    private static final int MAX_REVIEW_IMAGES = 3;

    private final PlaceReviewRepository placeReviewRepository;
    private final ReservationRepository reservationRepository;
    private final AdminUsersRepository usersRepository;
    private final ScheduleMemberRepository scheduleMemberRepository;
    private final PlaceImageRepository placeImageRepository;

    // 장소 후기 목록 조회 (상세 페이지)
    @Transactional(readOnly = true)
    public List<PlaceReviewDetailDTO> getPlaceReviews(Long placeId) {
        return placeReviewRepository.findByPlaceIdAndDeletedFalseOrderByCreateDateDesc(placeId).stream()
                .map(r -> PlaceReviewDetailDTO.builder()
                        .id(r.getId())
                        .rating(r.getRating())
                        .comment(r.getComment())
                        .reviewerNickname(r.getReviewer().getNickname())
                        .createdAt(r.getCreateDate())
                        .images(getReviewImagePaths(r.getId()))
                        .build())
                .toList();
    }

    // 후기 작성 (예약 종료 후 30일 이내)
    public Long createReview(Long reservationId, Long userId, PlaceReviewCreateDTO dto) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new IllegalArgumentException("예약을 찾을 수 없습니다."));
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        if (reservation.getReservationStatus() != ReservationStatus.COMPLETED) {
            throw new IllegalStateException("완료된 예약에만 후기를 작성할 수 있습니다.");
        }
        if (LocalDateTime.now().isAfter(reservation.getEndTime().plusDays(REVIEW_DEADLINE_DAYS))) {
            throw new IllegalStateException("후기 작성 가능 기간(" + REVIEW_DEADLINE_DAYS + "일)이 지났습니다.");
        }
        if (!isEligible(reservation, userId)) {
            throw new IllegalStateException("이 예약에 대한 후기 작성 권한이 없습니다.");
        }
        if (placeReviewRepository.existsByReservationIdAndReviewerUserIdAndDeletedFalse(reservationId, userId)) {
            throw new IllegalStateException("이미 작성한 후기가 있습니다.");
        }

        Place place = reservation.getPlace();
        PlaceReview review = PlaceReview.builder()
                .rating(dto.rating())
                .comment(dto.comment())
                .place(place)
                .reviewer(user)
                .reservation(reservation)
                .build();

        placeReviewRepository.save(review);
        place.updateRatingOnAdd(dto.rating());

        // 이미지 연결 (TEMP → USED, ownerId = reviewId)
        linkImages(dto.imagePaths(), userId, review.getId());

        return review.getId();
    }

    // 후기 수정 (시간 제한 없음)
    public void updateReview(Long reviewId, Long userId, PlaceReviewUpdateDTO dto) {
        PlaceReview review = placeReviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("후기를 찾을 수 없습니다."));

        if (!review.getReviewer().getUserId().equals(userId)) {
            throw new IllegalStateException("본인의 후기만 수정할 수 있습니다.");
        }

        int oldRating = review.getRating();
        review.update(dto.rating(), dto.comment());
        review.getPlace().updateRatingOnEdit(oldRating, dto.rating());

        // 이미지 차등 업데이트: 새 목록에 없는 것 soft delete
        List<String> newPaths = dto.imagePaths() != null ? dto.imagePaths() : List.of();
        if (newPaths.isEmpty()) {
            placeImageRepository.softDeleteExcludingPaths(ImageDomain.PLACE_REVIEW, reviewId, List.of("__none__"));
        } else {
            placeImageRepository.softDeleteExcludingPaths(ImageDomain.PLACE_REVIEW, reviewId, newPaths);
            linkImages(newPaths, userId, reviewId);
        }
    }

    // 후기 삭제 (시간 제한 없음)
    public void deleteReview(Long reviewId, Long userId) {
        PlaceReview review = placeReviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("후기를 찾을 수 없습니다."));

        if (!review.getReviewer().getUserId().equals(userId)) {
            throw new IllegalStateException("본인의 후기만 삭제할 수 있습니다.");
        }

        // 이미지 soft delete
        placeImageRepository.softDeleteExcludingPaths(ImageDomain.PLACE_REVIEW, reviewId, List.of("__none__"));

        review.getPlace().updateRatingOnDelete(review.getRating());
        placeReviewRepository.delete(review);
    }

    // 마이페이지 - 내가 쓴 후기 목록
    @Transactional(readOnly = true)
    public List<MyPlaceReviewDTO> getMyReviews(Long userId) {
        return placeReviewRepository.findByReviewerUserIdAndDeletedFalseOrderByCreateDateDesc(userId).stream()
                .map(r -> MyPlaceReviewDTO.builder()
                        .reviewId(r.getId())
                        .placeId(r.getPlace().getId())
                        .placeName(r.getPlace().getName())
                        .reservationStartTime(r.getReservation().getStartTime())
                        .rating(r.getRating())
                        .comment(r.getComment())
                        .createdAt(r.getCreateDate())
                        .images(getReviewImagePaths(r.getId()))
                        .build())
                .toList();
    }

    // 마이페이지 - 작성 가능한 후기 목록 (예약 종료 후 30일 이내 미작성)
    @Transactional(readOnly = true)
    public List<PendingReviewDTO> getPendingReviews(Long userId) {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(REVIEW_DEADLINE_DAYS);

        List<Reservation> personal = reservationRepository.findPendingPersonalReviews(userId, cutoff);
        List<Reservation> schedule = reservationRepository.findPendingScheduleReviews(userId, cutoff);

        List<Reservation> all = new ArrayList<>(personal);
        all.addAll(schedule);
        all.sort(Comparator.comparing(Reservation::getEndTime).reversed());

        return all.stream()
                .map(r -> PendingReviewDTO.builder()
                        .reservationId(r.getId())
                        .placeId(r.getPlace().getId())
                        .placeName(r.getPlace().getName())
                        .startTime(r.getStartTime())
                        .endTime(r.getEndTime())
                        .reviewDeadline(r.getEndTime().plusDays(REVIEW_DEADLINE_DAYS))
                        .build())
                .toList();
    }

    private List<String> getReviewImagePaths(Long reviewId) {
        return placeImageRepository.findByDomainAndOwnerIdAndDeletedFalse(ImageDomain.PLACE_REVIEW, reviewId)
                .stream()
                .sorted(Comparator.comparingLong(img -> img.getOrd()))
                .map(img -> img.getPath())
                .toList();
    }

    private void linkImages(List<String> imagePaths, Long userId, Long reviewId) {
        if (imagePaths == null || imagePaths.isEmpty()) return;

        List<String> paths = imagePaths.size() > MAX_REVIEW_IMAGES
                ? imagePaths.subList(0, MAX_REVIEW_IMAGES)
                : imagePaths;

        for (int i = 0; i < paths.size(); i++) {
            placeImageRepository.linkImageWithOrd(
                    userId,
                    paths.get(i),
                    ImageStatus.TEMP,
                    ImageStatus.USED,
                    ImageDomain.PLACE_REVIEW,
                    reviewId,
                    (long) i);
        }
    }

    private boolean isEligible(Reservation reservation, Long userId) {
        // 일반 예약: 예약자 본인만
        if (reservation.getSchedule() == null) {
            return reservation.getReservedBy().getUserId().equals(userId);
        }
        // 서클 일정: 일정 참여자(JOIN 상태) 전원
        return scheduleMemberRepository.existsByScheduleIdAndCircleMemberUserUserIdAndStatus(
                reservation.getSchedule().getScheduleId(), userId, ScheduleMemberStatus.JOIN);
    }
}
