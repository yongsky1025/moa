package com.soldesk.moa.place.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.soldesk.moa.common.entity.Likes;
import com.soldesk.moa.common.entity.constant.LikeTargetType;
import com.soldesk.moa.users.entity.Users;

public interface PlaceLikesRepository extends JpaRepository<Likes, Long> {

    // 좋아요 존재하는지(토글용)
    boolean existsByUserAndTargetTypeAndTargetId(
            Users user, LikeTargetType targetType, Long targetId);

    // 좋아요 삭제(hard delete로 가겠음)
    void deleteByUserAndTargetTypeAndTargetId(
            Users user, LikeTargetType targetType, Long targetId);

    // 좋아요개수
    long countByTargetTypeAndTargetId(LikeTargetType targetType, Long targetId);
}
