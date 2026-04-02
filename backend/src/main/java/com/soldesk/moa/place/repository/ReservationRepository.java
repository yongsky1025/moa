package com.soldesk.moa.place.repository;

import java.time.LocalDate;
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

    // =-=-=-=-=-=-=-===-= 결제 관련 쿼리 =-=-=-=-=-=-=-=-=-=-=-=
    // 시간대 중복 검증
    @Query("""
            SELECT COUNT(r) > 0 FROM Reservation r
            WHERE r.place.id = :placeId
            AND r.reservationStatus IN ('HOLDING', 'RESERVED')
            AND r.startTime < :endTime
            AND r.endTime > :startTime
            """)
    boolean existsOverlapping(
            @Param("placeId") Long placeId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime);

    // HOLDING 만료 스케줄러용
    @Query("""
            SELECT r FROM Reservation r
            WHERE r.reservationStatus = 'HOLDING'
            AND r.holdExpiredAt < :now
            """)
    List<Reservation> findExpiredHoldings(@Param("now") LocalDateTime now);

    // 날짜별 점유 시간대 조회 (슬롯 표시용)
    @Query("""
            SELECT r FROM Reservation r
            WHERE r.place.id = :placeId
            AND r.reservationStatus IN ('HOLDING', 'RESERVED')
            AND CAST(r.startTime AS date) = :date
            """)
    List<Reservation> findOccupiedSlots(
            @Param("placeId") Long placeId,
            @Param("date") LocalDate date);

    // 내 예약 목록 (HOLDING 제외, 최신순)
    @Query("""
            SELECT r FROM Reservation r
            JOIN FETCH r.place p
            WHERE r.reservedBy.userId = :userId
            AND r.reservationStatus IN (
                com.soldesk.moa.place.entity.constant.ReservationStatus.RESERVED,
                com.soldesk.moa.place.entity.constant.ReservationStatus.COMPLETED,
                com.soldesk.moa.place.entity.constant.ReservationStatus.CANCELLED
            )
            ORDER BY r.startTime DESC
            """)
    List<Reservation> findMyReservations(@Param("userId") Long userId);

    // 일정에 연결된 활성 예약 조회 (일정 삭제 전 확인용)
    @Query("""
            SELECT r FROM Reservation r
            WHERE r.schedule.scheduleId = :scheduleId
            AND r.reservationStatus IN ('HOLDING', 'RESERVED')
            """)
    List<Reservation> findActiveByScheduleId(@Param("scheduleId") Long scheduleId);

    // 일정 상세 조회 시 연결된 예약 단건 조회 (place fetch join)
    @Query("""
            SELECT r FROM Reservation r
            JOIN FETCH r.place
            WHERE r.schedule.scheduleId = :scheduleId
            AND r.reservationStatus IN ('HOLDING', 'RESERVED')
            ORDER BY r.startTime ASC
            """)
    List<Reservation> findActiveByScheduleIdWithPlace(@Param("scheduleId") Long scheduleId);
}
