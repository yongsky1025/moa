package com.soldesk.moa.auth.dto;

import java.time.LocalDate;

import org.springframework.format.annotation.DateTimeFormat;

import com.soldesk.moa.users.entity.constant.UserGender;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotNull;
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

    @NotNull(message = "성별을 선택해주세요.")
    private UserGender userGender;

    @AssertTrue(message = "개인정보 수집 및 이용에 동의해주세요.")
    private boolean privacyAgreed;
}
