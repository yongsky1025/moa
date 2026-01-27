package com.soldesk.moa.circle.dto;

import com.soldesk.moa.circle.entity.CircleMember;
import com.soldesk.moa.circle.entity.constant.CircleMemberStatus;
import com.soldesk.moa.circle.entity.constant.CircleRole;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class CircleMemberResponseDTO {

    private Long circleMemberId;
    private Long userId;
    private String nickname;
    private CircleRole role;
    private CircleMemberStatus status;

    public static CircleMemberResponseDTO from(CircleMember member) {
        return new CircleMemberResponseDTO(
                member.getId(),
                member.getUser().getUserId(),
                member.getUser().getNickname(),
                member.getRole(),
                member.getStatus()
        );
    }
}
