package com.soldesk.moa.circle.entity;

import com.soldesk.moa.circle.entity.constant.CircleMemberStatus;
import com.soldesk.moa.circle.entity.constant.CircleRole;
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
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Entity
@Table(name = "circle_member")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CircleMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 회원
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private Users user;

    // 서클
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "circle_id")
    private Circle circle;

    // 역할: 모임장 / 일반회원
    @Enumerated(EnumType.STRING)
    private CircleRole role;

    // 가입 상태 (확장 대비)
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CircleMemberStatus status;

    // 멤버 상태 변경
    public void changeStatus(CircleMemberStatus status) {
        this.status = status;
    }
}