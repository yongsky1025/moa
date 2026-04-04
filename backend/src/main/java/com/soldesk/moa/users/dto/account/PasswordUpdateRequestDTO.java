package com.soldesk.moa.users.dto.account;

import jakarta.validation.constraints.AssertTrue;
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

    @AssertTrue(message = "새 비밀번호와 새 비밀번호 확인이 일치하지 않습니다.")
    public boolean isNewPasswordMatched() {
        if (newPassword == null || newPassword.isBlank()) {
            return true;
        }
        if (newPasswordConfirm == null || newPasswordConfirm.isBlank()) {
            return true;
        }
        return newPassword.equals(newPasswordConfirm);
    }
}
