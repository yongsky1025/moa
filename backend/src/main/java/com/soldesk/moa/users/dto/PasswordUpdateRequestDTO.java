package com.soldesk.moa.users.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Builder
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class PasswordUpdateRequestDTO {

    @NotBlank
    private String currentPassword;

    @NotBlank
    @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d)(?=.*[!@#$%^&*])[A-Za-z\\d!@#$%^&*]{8,20}$", message = "비밀번호는 영문, 숫자, 특수문자 포함 8-20자 이내여야 합니다.")
    private String newPassword;

    @NotBlank
    private String newPasswordConfirm;
}
