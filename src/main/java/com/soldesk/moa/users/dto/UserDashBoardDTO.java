package com.soldesk.moa.users.dto;

import com.soldesk.moa.users.entity.Users;
import com.soldesk.moa.users.entity.constant.UserGender;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Builder
@Data
@ToString
@NoArgsConstructor
@Getter
@AllArgsConstructor
public class UserDashBoardDTO {
    // 현재 로그인한 유저의 정보 - 마이 페이지에 표시할 정보들
    private String email;
    private String name;
    private String nickname;
    private String password;
    private String address;
    private UserGender userGender;

    public UserDashBoardDTO(Users user) {
        this.email = user.getEmail();
        this.name = user.getName();
        this.nickname = user.getNickname();
        this.address = user.getAddress();
        this.password = user.getPassword();
        this.userGender = user.getUserGender();
    };
}
