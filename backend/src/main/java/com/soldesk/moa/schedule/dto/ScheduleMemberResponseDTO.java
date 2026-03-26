package com.soldesk.moa.schedule.dto;

import com.soldesk.moa.circle.entity.constant.CircleRole;
import com.soldesk.moa.schedule.entity.ScheduleMember;

import lombok.Getter;

@Getter
public class ScheduleMemberResponseDTO {

    private Long userId;
    private String nickname;
    private CircleRole role;

    public ScheduleMemberResponseDTO(ScheduleMember scheduleMember) {
        this.userId = scheduleMember.getCircleMember().getUser().getUserId();
        this.nickname = scheduleMember.getCircleMember().getUser().getNickname();
        this.role = scheduleMember.getCircleMember().getRole();
    }
}
