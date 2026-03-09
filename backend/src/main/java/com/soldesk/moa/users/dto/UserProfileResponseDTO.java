package com.soldesk.moa.users.dto;

import java.time.LocalDate;
import com.soldesk.moa.users.entity.constant.UserGender;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
public class UserProfileResponseDTO {

    private String name;

    private String nickname;

    private String address;

    private String email;

    private String phone;

    private int age;

    private UserGender userGender;

    private LocalDate birthDate;
}
