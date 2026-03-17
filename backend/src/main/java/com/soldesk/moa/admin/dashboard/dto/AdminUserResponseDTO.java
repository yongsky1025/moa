package com.soldesk.moa.admin.dashboard.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.soldesk.moa.users.entity.constant.UserGender;
import com.soldesk.moa.users.entity.constant.UserRole;
import com.soldesk.moa.users.entity.constant.UserStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminUserResponseDTO {
    private Long userId;

    private String name;

    private int age;

    private LocalDate birth;

    // private String phone; // 컬럼 삭제로 인해 불필요

    private UserGender gender;

    private UserStatus status;

    private LocalDateTime createDate;

    private UserRole role;
}
