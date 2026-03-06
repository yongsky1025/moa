package com.soldesk.moa.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class LoginRequestDTO {

    @NotBlank
    private String email;

    @NotBlank
    private String password;

}

