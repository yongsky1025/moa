package com.soldesk.moa.auth.dto;

import java.time.LocalDate;

import org.springframework.format.annotation.DateTimeFormat;

import com.soldesk.moa.users.entity.constant.UserGender;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class SocialSignUpCompleteRequestDTO {

    @NotNull(message = "생년월일을 입력해주세요.")
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate birthDate;

    @NotBlank
    @Pattern(regexp = "^[가-힣a-zA-Z0-9]{2,10}$", message = "닉네임은 2~10자 이내여야 합니다.(공백, 특수문자 제외)")
    private String nickname;

    @NotNull(message = "성별을 선택해주세요.")
    private UserGender userGender;

    @AssertTrue(message = "개인정보 수집 및 이용에 동의해주세요.")
    private boolean privacyAgreed;
}
