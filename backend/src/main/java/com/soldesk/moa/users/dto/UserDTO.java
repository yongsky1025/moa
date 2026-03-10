package com.soldesk.moa.users.dto;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Builder
// @Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class UserDTO {

    private Long userId;

    private String name;

    private String email;

    private String password;

    private String nickname;

    private LocalDate birthDate;

    private String userRole;

    private String userGender;

}
