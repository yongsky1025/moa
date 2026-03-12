package com.soldesk.moa.circle.entity;

import com.soldesk.moa.circle.entity.constant.CircleStatus;
import com.soldesk.moa.common.entity.BaseEntity;
import com.soldesk.moa.common.entity.Image;

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
import jakarta.persistence.OneToOne;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@ToString(exclude = { "category", "coverImage" })
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

    // 서클 대표 이미지 (없을 수 있음)
    @OneToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "cover_image_id", nullable = true)
    private Image coverImage;

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

    // 서클 정보 수정 (리더 전용)
    // coverImage가 null이면 기존 이미지 유지
    public void update(String name, String description, int maxMember, Image coverImage) {
        this.name = name;
        this.description = description;
        this.maxMember = maxMember;
        if (coverImage != null) {
            this.coverImage = coverImage;
        }
        // 정원을 늘려서 현재 인원보다 많아지면 FULL → OPEN
        if (this.status == CircleStatus.FULL && maxMember > this.currentMember) {
            this.status = CircleStatus.OPEN;
        }
    }
}
