package com.soldesk.moa.circle.entity;

import com.soldesk.moa.circle.entity.constant.CircleMemberStatus;
import com.soldesk.moa.circle.entity.constant.CircleStatus;
import com.soldesk.moa.common.entity.BaseEntity;

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
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@ToString(exclude = "category")
@Entity
public class Circle extends BaseEntity {

    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Id
    private Long circleId;

    @Column(unique = true)
    private String name;

    private String description;

    @Enumerated(EnumType.STRING)
    private CircleStatus status;

    private int maxMember;

    private int currentMember;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private CircleCategory category;

    // 상태 변경
    public void increaseMember() {
        if (this.status == CircleStatus.FULL) {
            throw new IllegalStateException("이미 정원이 가득 찬 서클입니다.");
        }
        this.currentMember++;
        if (this.currentMember >= this.maxMember) {
            this.status = CircleStatus.FULL;
        }
    }

    // 멤버 탈퇴시 현재 인원 감소
    public void decreaseMember() {
        if (this.currentMember > 0) {
            this.currentMember--;
        }
    }
}
