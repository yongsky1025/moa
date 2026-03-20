package com.soldesk.moa.admin.dashboard.dto.userInfo;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.soldesk.moa.users.entity.constant.UserGender;
import com.soldesk.moa.users.entity.constant.UserRole;
import com.soldesk.moa.users.entity.constant.UserStatus;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class UserInfoDTO {

    private Long userId;

    private String name;

    private int age;

    private String address;

    private LocalDate birthDate;

    private UserGender gender;

    private UserRole role;

    private UserStatus userStatus;

    private LocalDateTime createDate;

    private long countCreateBoard;

    private long countCreateReply;

    private long countJoinCircle;

}
