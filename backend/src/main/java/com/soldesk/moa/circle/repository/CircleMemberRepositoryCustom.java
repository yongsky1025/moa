package com.soldesk.moa.circle.repository;

import com.soldesk.moa.circle.entity.CircleMember;
import com.soldesk.moa.circle.entity.constant.CircleMemberStatus;
import com.soldesk.moa.common.dto.PageRequestDTO;
import com.soldesk.moa.common.dto.PageResultDTO;

public interface CircleMemberRepositoryCustom {
    PageResultDTO<CircleMember> findMembers(
            Long circleId,
            CircleMemberStatus status,
            PageRequestDTO pageRequestDTO);
}
