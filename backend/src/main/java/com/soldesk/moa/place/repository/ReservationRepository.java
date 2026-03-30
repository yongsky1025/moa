package com.soldesk.moa.place.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.soldesk.moa.place.entity.Reservation;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    // 스케줄러로 예약 상태 변경(completed)
    @Query("""
            SELECT r
            FROM Reservation r
            WHERE r.reservationStatus = 'RESERVED'
            AND r.endTime < :now
            """)
    List<Reservation> findExpiredReservations(LocalDateTime now);

    // 개인 예약 중 작성 대기 중인 후기 (schedule 없음, 본인이 예약)
    @Query("""
            SELECT r FROM Reservation r
            WHERE r.reservedBy.userId = :userId
            AND r.schedule IS NULL
            AND r.reservationStatus = com.soldesk.moa.place.entity.constant.ReservationStatus.COMPLETED
            AND r.endTime >= :cutoff
            AND NOT EXISTS (
                SELECT pr FROM PlaceReview pr
                WHERE pr.reservation.id = r.id
                AND pr.reviewer.userId = :userId
            )
            ORDER BY r.endTime DESC
            """)
    List<Reservation> findPendingPersonalReviews(@Param("userId") Long userId, @Param("cutoff") LocalDateTime cutoff);

    // 서클 일정 참여자로서 작성 대기 중인 후기
    @Query("""
            SELECT r FROM Reservation r
            WHERE r.schedule IS NOT NULL
            AND EXISTS (
                SELECT sm FROM ScheduleMember sm
                WHERE sm.schedule.scheduleId = r.schedule.scheduleId
                AND sm.circleMember.user.userId = :userId
                AND sm.status = com.soldesk.moa.schedule.entity.constant.ScheduleMemberStatus.JOIN
            )
            AND r.reservationStatus = com.soldesk.moa.place.entity.constant.ReservationStatus.COMPLETED
            AND r.endTime >= :cutoff
            AND NOT EXISTS (
                SELECT pr FROM PlaceReview pr
                WHERE pr.reservation.id = r.id
                AND pr.reviewer.userId = :userId
            )
            ORDER BY r.endTime DESC
            """)
    List<Reservation> findPendingScheduleReviews(@Param("userId") Long userId, @Param("cutoff") LocalDateTime cutoff);
}
