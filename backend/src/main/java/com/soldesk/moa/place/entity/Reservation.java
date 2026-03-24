package com.soldesk.moa.place.entity;

import java.time.LocalDateTime;

import com.soldesk.moa.common.entity.BaseEntity;
import com.soldesk.moa.place.entity.constant.ReservationStatus;
import com.soldesk.moa.schedule.entity.Schedule;
import com.soldesk.moa.users.entity.Users;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Version;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@ToString(exclude = { "place", "schedule", "reservedBy" })
public class Reservation extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDateTime startTime;

    @Column(nullable = false)
    private LocalDateTime endTime;

    @Column(nullable = false)
    private Integer totalPrice;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ReservationStatus reservationStatus = ReservationStatus.HOLDING;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "place_id")
    private Place place;

    @ManyToOne(fetch = FetchType.LAZY, optional = true) // true => 일정이 없이 장소대여를할수있기에(일반유저)
    @JoinColumn(name = "schedule_id", nullable = true)
    private Schedule schedule; // 예약한 일정 정보

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "reserved_by")
    private Users reservedBy;

    @Column
    private LocalDateTime holdExpiredAt; // holding 상태 만료 시각(결제 대기)

    @Version
    private Integer version; // 동시 예약 방지 낙관적락 사용 version

    // 예약 상태 변경 스케줄러
    public void setReservationStatus(ReservationStatus reservationStatus) {
        this.reservationStatus = reservationStatus;
    }
}
