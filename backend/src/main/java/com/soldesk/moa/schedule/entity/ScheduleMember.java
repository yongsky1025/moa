package com.soldesk.moa.schedule.entity;

import com.soldesk.moa.circle.entity.CircleMember;
import com.soldesk.moa.schedule.entity.constant.ScheduleMemberStatus;

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
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "schedule_member")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScheduleMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 참여 일정
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "schedule_id", nullable = false)
    private Schedule schedule;

    // 참여 서클 멤버
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "circle_member_id", nullable = false)
    private CircleMember circleMember;

    // 참여 상태
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ScheduleMemberStatus status;
}
