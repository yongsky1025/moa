package com.soldesk.moa.common.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.soldesk.moa.common.entity.Likes;
import com.soldesk.moa.common.entity.constant.LikeTargetType;
import com.soldesk.moa.users.entity.Users;

public interface LikesRepository extends JpaRepository<Likes, Long> {

        // 좋아요 존재하는지(토글용)
        boolean existsByUserAndTargetTypeAndTargetId(
                        Users user, LikeTargetType targetType, Long targetId);

        // 좋아요 삭제(hard delete로 가겠음)
        void deleteByUserAndTargetTypeAndTargetId(
                        Users user, LikeTargetType targetType, Long targetId);

        // 좋아요개수
        long countByTargetTypeAndTargetId(LikeTargetType targetType, Long targetId);

        // 유저가 특정 타입에 좋아요한 목록
        List<Likes> findByUserAndTargetType(Users user, LikeTargetType targetType);

        // 유저가 좋아요한 targetId 목록만 조회 (N+1 방지용)
        @Query("SELECT l.targetId FROM Likes l WHERE l.user = :user AND l.targetType = :targetType")
        List<Long> findTargetIdsByUserAndTargetType(
                        @Param("user") Users user,
                        @Param("targetType") LikeTargetType targetType);

        // 여러 targetId에 대한 좋아요 수 일괄 집계 (N+1 방지용)
        @Query("SELECT l.targetId, COUNT(l) FROM Likes l WHERE l.targetType = :targetType AND l.targetId IN :targetIds GROUP BY l.targetId")
        List<Object[]> countGroupByTargetIdIn(
                        @Param("targetType") LikeTargetType targetType,
                        @Param("targetIds") List<Long> targetIds);
}
