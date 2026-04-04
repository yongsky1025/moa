package com.soldesk.moa.schedule.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

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

@Entity
@Table(name = "schedule_review")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScheduleReview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long reviewId;

    // 리뷰 대상 일정
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "schedule_id", nullable = false)
    private Schedule schedule;

    // 작성자 (서클 멤버)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "circle_member_id", nullable = false)
    private CircleMember circleMember;

    // 후기 내용 (CKEditor HTML)
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    // 별점 (1~5)
    @Column(nullable = false)
    private int rating;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
