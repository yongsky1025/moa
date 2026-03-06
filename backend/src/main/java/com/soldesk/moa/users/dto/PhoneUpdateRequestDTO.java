package com.soldesk.moa.users.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class PhoneUpdateRequestDTO {

    @NotBlank(message = "필수")
    @Pattern(regexp = "^01(?:0|1|[6-9])(?:-?\\d{3,4})-?\\d{4}$", message = "휴대폰 번호 형식이 올바르지 않습니다. 010-1234-5678")
    private String phone;
}
