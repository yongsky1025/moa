package com.soldesk.moa.schedule.entity;

import com.soldesk.moa.circle.entity.Circle;
import com.soldesk.moa.circle.entity.CircleMember;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "schedule")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Schedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long scheduleId;

    // 일정 제목
    @Column(nullable = false, length = 100)
    private String title;

    // 간단한 일정 소개
    @Column(length = 255)
    private String description;

    // 최대 참여 인원
    @Column(nullable = false)
    private int maxMember;

    // 현재 인원
    private int currentMember;

    // 일정 생성자 (서클 멤버)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creator_circle_member_id", nullable = false)
    private CircleMember creator;

    // 소속 서클
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "circle_id", nullable = false)
    private Circle circle;

    // 일정 시작
    @Column(nullable = false)
    private LocalDateTime startAt;

    // 일정 종료
    @Column(nullable = false)
    private LocalDateTime endAt;

    // 위치 정보 (주소 / 장소명)
    @Column(length = 255)
    private String address;

    // 위도
    @Column
    private Double latitude;

    // 경도
    @Column
    private Double longitude;

    public void increaseCurrentMember() {
        if (this.currentMember >= this.maxMember) {
            throw new IllegalStateException("정원 초과");
        }
        this.currentMember++;
    }
}