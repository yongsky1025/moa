package com.soldesk.moa.users.dto;

import com.soldesk.moa.users.entity.Users;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class CurrentUserResponseDTO {
    // 현재 로그인한 유저의 정보 - 마이 페이지에 표시할 정보들
    private String email;
    private String name;
    private String nickname;
    private String address;

    public CurrentUserResponseDTO(Users user) {
        this.email = user.getEmail();
        this.name = user.getName();
        this.nickname = user.getNickname();
        this.address = user.getAddress();
    };
}
