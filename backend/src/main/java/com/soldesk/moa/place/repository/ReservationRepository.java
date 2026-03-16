package com.soldesk.moa.place.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

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
}
