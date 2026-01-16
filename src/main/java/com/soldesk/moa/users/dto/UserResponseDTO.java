package com.soldesk.moa.users.dto;

import com.soldesk.moa.users.entity.Users;
import com.soldesk.moa.users.entity.constant.UserRole;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UserResponseDTO {

    private Long userId;
    private String name;
    private String email;
    private String nickname;
    private String address;
    private UserRole userRole;

    /**
     * 엔티티 → DTO 변환
     */
    public static UserResponseDTO from(Users user) {
        return UserResponseDTO.builder()
                .userId(user.getUserId())
                .name(user.getName())
                .email(user.getEmail())
                .nickname(user.getNickname())
                .address(user.getAddress())
                .userRole(user.getUserRole())
                .build();
    }
}