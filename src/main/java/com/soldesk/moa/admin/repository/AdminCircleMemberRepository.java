package com.soldesk.moa.admin.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.soldesk.moa.circle.entity.CircleMember;

public interface AdminCircleMemberRepository extends JpaRepository<CircleMember, Long> {

    // 모임에 가입되어있는(현재 활동 중, 승인대기x) 유저 수
    @Query("select count(cm) from CircleMember cm where cm.status = 'active'")
    Long getCountCircleMember();
}
