package com.soldesk.moa.circle.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.soldesk.moa.circle.entity.Circle;
import com.soldesk.moa.circle.entity.CircleMember;
import com.soldesk.moa.circle.entity.constant.CircleMemberStatus;
import com.soldesk.moa.circle.entity.constant.CircleRole;
import com.soldesk.moa.users.entity.Users;

public interface CircleMemberRepository extends JpaRepository<CircleMember, Long>,
        CircleMemberRepositoryCustom {

    // 이미 가입했거나(PENDING, ACTIVE)
    // 가입 신청 중인지 확인
    boolean existsByCircleAndUserAndStatusIn(
            Circle circle,
            Users user,
            List<CircleMemberStatus> statuses);

    // 특정 서클의 특정 상태 멤버 수 조회
    int countByCircleAndStatus(
            Circle circle,
            CircleMemberStatus status);

    // 해당 서클에서 해당 유저가특정 역할(LEADER)을 가지고 있는지 확인
    Optional<CircleMember> findByCircleAndUserAndRole(
            Circle circle,
            Users user,
            CircleRole role);

    // 특정 서클의 특정 상태(PENDING, ACTIVE 등) 멤버 조회
    List<CircleMember> findByCircleAndStatus(
            Circle circle,
            CircleMemberStatus status);

    // 해당 서클에 ACTIVE 상태로 가입한 멤버인지 확인
    Optional<CircleMember> findByCircleAndUser_UserIdAndStatus(
            Circle circle,
            Long userId,
            CircleMemberStatus status);

    // ########### Board 요청 ###########
    // ⚠️ CircleMember/Users/PK 필드명에 맞춰 수정 필요
    // 써클 소속 유저 확인
    boolean existsByCircle_CircleIdAndUser_UserId(Long circleId, Long userId);
    // boolean existsByCircleId_CircleIdAndUserId_UserId(Long circleId, Long
    // userId);
}
