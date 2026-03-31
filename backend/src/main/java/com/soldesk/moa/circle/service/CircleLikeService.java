package com.soldesk.moa.circle.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import com.soldesk.moa.circle.dto.CircleLikeResponseDTO;
import com.soldesk.moa.circle.dto.CircleResponseDTO;
import com.soldesk.moa.circle.entity.Circle;
import com.soldesk.moa.circle.repository.CircleRepository;
import com.soldesk.moa.common.entity.Likes;
import com.soldesk.moa.common.entity.constant.LikeTargetType;
import com.soldesk.moa.common.repository.LikesRepository;
import com.soldesk.moa.users.entity.Users;
import com.soldesk.moa.users.repository.UsersRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CircleLikeService {

    private final LikesRepository likesRepository;
    private final UsersRepository usersRepository;
    private final CircleRepository circleRepository;

    @Transactional
    public CircleLikeResponseDTO toggle(Long userId, Long circleId) {
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        if (!circleRepository.existsById(circleId)) {
            throw new IllegalArgumentException("서클을 찾을 수 없습니다.");
        }

        boolean alreadyLiked = likesRepository.existsByUserAndTargetTypeAndTargetId(
                user, LikeTargetType.CIRCLE, circleId);

        if (alreadyLiked) {
            likesRepository.deleteByUserAndTargetTypeAndTargetId(user, LikeTargetType.CIRCLE, circleId);
        } else {
            likesRepository.save(Likes.builder()
                    .user(user)
                    .targetType(LikeTargetType.CIRCLE)
                    .targetId(circleId)
                    .build());
        }

        long likeCount = likesRepository.countByTargetTypeAndTargetId(LikeTargetType.CIRCLE, circleId);

        return CircleLikeResponseDTO.builder()
                .circleId(circleId)
                .liked(!alreadyLiked)
                .likeCount(likeCount)
                .build();
    }

    @Transactional(readOnly = true)
    public List<CircleResponseDTO> getLikedCircles(Long userId) {
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // 1) 좋아요한 circleId 목록 조회 (1 query)
        List<Long> likedIds = likesRepository.findTargetIdsByUserAndTargetType(user, LikeTargetType.CIRCLE);
        if (likedIds.isEmpty()) return List.of();

        // 2) 서클 목록 일괄 조회 (1 query)
        List<Circle> circles = circleRepository.findAllById(likedIds);

        // 3) 좋아요 수 일괄 집계 (1 query)
        Map<Long, Long> countMap = likesRepository
                .countGroupByTargetIdIn(LikeTargetType.CIRCLE, likedIds)
                .stream()
                .collect(Collectors.toMap(
                        row -> (Long) row[0],
                        row -> (Long) row[1]));

        return circles.stream()
                .map(c -> CircleResponseDTO.from(c, countMap.getOrDefault(c.getCircleId(), 0L)))
                .toList();
    }

    @Transactional(readOnly = true)
    public CircleLikeResponseDTO getStatus(Long userId, Long circleId) {
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        boolean liked = likesRepository.existsByUserAndTargetTypeAndTargetId(
                user, LikeTargetType.CIRCLE, circleId);
        long likeCount = likesRepository.countByTargetTypeAndTargetId(LikeTargetType.CIRCLE, circleId);

        return CircleLikeResponseDTO.builder()
                .circleId(circleId)
                .liked(liked)
                .likeCount(likeCount)
                .build();
    }
}
