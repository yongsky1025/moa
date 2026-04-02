package com.soldesk.moa.place.repository;

import java.util.List;
import java.util.Set;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.soldesk.moa.place.entity.PlaceReview;

public interface PlaceReviewRepository extends JpaRepository<PlaceReview, Long> {

    List<PlaceReview> findByPlaceIdOrderByCreateDateDesc(Long placeId);

    List<PlaceReview> findByReviewerUserIdOrderByCreateDateDesc(Long userId);

    boolean existsByReservationIdAndReviewerUserId(Long reservationId, Long userId);

    @Query("SELECT pr.reservation.id FROM PlaceReview pr WHERE pr.reviewer.userId = :userId AND pr.reservation.id IN :reservationIds")
    Set<Long> findReviewedReservationIds(@Param("userId") Long userId, @Param("reservationIds") List<Long> reservationIds);
}
