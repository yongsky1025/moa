package com.soldesk.moa.users.entity;

import com.soldesk.moa.common.entity.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Table(name = "user_energy_profile")
@Entity
public class UsersEnergyProfile extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long profileId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private Users user;

    // === 5축 에너지 스코어 (1~5) ===

    // 사회적 부담도: 1(혼자 선호) ~ 5(대규모 선호)
    @Column(nullable = false)
    private Integer socialLoad;

    // 상호작용 방식: 1(최소 교류) ~ 5(적극 교류)
    @Column(nullable = false)
    private Integer interactionMode;

    // 구조화 수준: 1(자유로운) ~ 5(체계적)
    @Column(nullable = false)
    private Integer structureLevel;

    // 활동 강도: 1(정적) ~ 5(동적)
    @Column(nullable = false)
    private Integer activityIntensity;

    // 참여 부담도: 1(가벼운) ~ 5(깊은 몰입)
    @Column(nullable = false)
    private Integer commitmentLevel;

    // === 스코어 업데이트 ===

    public void updateScores(Integer socialLoad, Integer interactionMode,
            Integer structureLevel, Integer activityIntensity,
            Integer commitmentLevel) {
        this.socialLoad = socialLoad;
        this.interactionMode = interactionMode;
        this.structureLevel = structureLevel;
        this.activityIntensity = activityIntensity;
        this.commitmentLevel = commitmentLevel;
    }
}