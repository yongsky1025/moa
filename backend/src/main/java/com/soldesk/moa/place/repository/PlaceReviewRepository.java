package com.soldesk.moa.place.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.soldesk.moa.place.entity.PlaceReview;

public interface PlaceReviewRepository extends JpaRepository<PlaceReview, Long> {

    List<PlaceReview> findByPlaceIdOrderByCreateDateDesc(Long placeId);

    List<PlaceReview> findByReviewerUserIdOrderByCreateDateDesc(Long userId);

    boolean existsByReservationIdAndReviewerUserId(Long reservationId, Long userId);
}
