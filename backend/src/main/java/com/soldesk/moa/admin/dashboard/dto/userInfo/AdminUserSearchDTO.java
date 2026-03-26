package com.soldesk.moa.admin.dashboard.dto.userInfo;

import com.soldesk.moa.common.dto.PageRequestDTO;
import com.soldesk.moa.users.entity.constant.UserGender;
import com.soldesk.moa.users.entity.constant.UserRole;
import com.soldesk.moa.users.entity.constant.UserStatus;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class AdminUserSearchDTO extends PageRequestDTO {

    // 필터링 조건
    private UserStatus status;

    private UserGender gender;

    private UserRole role;

    // 정렬 (newest|oldest|name|age_asc|age_desc)
    private String sort;
}
