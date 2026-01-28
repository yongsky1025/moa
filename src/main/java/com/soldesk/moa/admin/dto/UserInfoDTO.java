package com.soldesk.moa.admin.dto;

import java.time.LocalDateTime;

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

    private UserStatus userStatus;

    private LocalDateTime createDate;

    private long countCreateBoard;

    private long countCreateReply;

}
