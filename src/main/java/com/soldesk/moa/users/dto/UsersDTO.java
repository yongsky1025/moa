package com.soldesk.moa.users.dto;

import groovy.transform.ToString;
import groovy.transform.builder.Builder;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@ToString
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Setter
@Getter
public class UsersDTO {

    @Email(message = "이메일을 작성해 주세요.")
    @NotNull(message = "필수")
    private String email;

    @NotNull(message = "필수")
    private String name;

    @NotNull(message = "필수")
    private String nickname;

    @NotNull(message = "필수")
    private String password;

    @NotNull(message = "필수")
    private String address;

}
