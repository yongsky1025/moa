package com.soldesk.moa.circle.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.soldesk.moa.circle.entity.CircleMember;
import com.soldesk.moa.circle.entity.constant.CircleMemberStatus;
import com.soldesk.moa.circle.repository.CircleMemberRepository;
import com.soldesk.moa.users.entity.Users;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class CircleMemberService {

    private final CircleMemberRepository circleMemberRepository;

    public void changeStatus(
            Long memberId,
            CircleMemberStatus status,
            Users loginUser) {

        CircleMember member = circleMemberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("멤버 없음"));

        // 리더 체크
        CircleMember leader = circleMemberRepository
                .findLeaderByCircle(member.getCircle(), loginUser)
                .orElseThrow(() -> new AccessDeniedException("리더만 가능"));

        member.changeStatus(status);

        if (status == CircleMemberStatus.ACTIVE) {
            member.getCircle().increaseMember();
        }
    }
}
