package com.soldesk.moa.circle.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.soldesk.moa.circle.entity.CircleEnergyProfile;
import com.soldesk.moa.circle.entity.constant.CircleStatus;

public interface CircleEnergyProfileRepository extends JpaRepository<CircleEnergyProfile, Long> {

    // 서클 상태 기준으로 에너지 프로필 조회 (JOIN 1회로 N+1 방지)
    List<CircleEnergyProfile> findByCircle_Status(CircleStatus status);
}
