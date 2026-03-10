package com.soldesk.moa.users.dto.account;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class WithdrawRequestDTO {

    @NotBlank(message = "비밀번호를 입력해주세요.")
    private String password;
}
