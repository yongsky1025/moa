package com.soldesk.moa.schedule.dto;

import com.soldesk.moa.circle.entity.constant.CircleRole;
import com.soldesk.moa.schedule.entity.ScheduleMember;
import com.soldesk.moa.schedule.entity.constant.ScheduleMemberStatus;

import lombok.Getter;

@Getter
public class ScheduleMemberResponseDTO {

    private Long scheduleMemberId;
    private Long userId;
    private String nickname;
    private CircleRole role;
    private ScheduleMemberStatus status;

    public ScheduleMemberResponseDTO(ScheduleMember scheduleMember) {
        this.scheduleMemberId = scheduleMember.getId();
        this.userId = scheduleMember.getCircleMember().getUser().getUserId();
        this.nickname = scheduleMember.getCircleMember().getUser().getNickname();
        this.role = scheduleMember.getCircleMember().getRole();
        this.status = scheduleMember.getStatus();
    }
}
