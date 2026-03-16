package com.soldesk.moa.users.dto.profile;

import java.time.LocalDate;
import com.soldesk.moa.users.entity.constant.UserGender;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
public class UserProfileResponseDTO {

    private String name;

    private String nickname;

    private String email;

    private int age;

    private UserGender userGender;

    private LocalDate birthDate;

    private String statusMessage;
}
