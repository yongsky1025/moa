package com.soldesk.moa.board.service;

import java.util.Objects;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import com.soldesk.moa.circle.entity.constant.CircleMemberStatus;
import com.soldesk.moa.circle.entity.constant.CircleRole;
import com.soldesk.moa.circle.repository.CircleMemberRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CirclePermissionService {

    private final CircleMemberRepository circleMemberRepository;

    public void requireActiveMember(Long circleId, Long userId) {
        boolean activeMember = circleMemberRepository
                .existsByCircle_CircleIdAndUser_UserIdAndStatus(circleId, userId, CircleMemberStatus.ACTIVE);
        if (!activeMember) {
            throw new AccessDeniedException("[#CIRCLE] ACTIVE 멤버만 접근할 수 있습니다.");
        }
    }

    public void requireLeader(Long circleId, Long userId) {
        boolean leader = circleMemberRepository
                .existsByCircle_CircleIdAndUser_UserIdAndStatusAndRole(
                        circleId,
                        userId,
                        CircleMemberStatus.ACTIVE,
                        CircleRole.LEADER);
        if (!leader) {
            throw new AccessDeniedException("[#CIRCLE] 리더만 접근할 수 있습니다.");
        }
    }

    public boolean canEditOwnContent(Long ownerId, Long userId) {
        return Objects.equals(ownerId, userId);
    }
}
