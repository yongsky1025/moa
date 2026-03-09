package com.soldesk.moa.users.dto;

import java.time.LocalDate;

import org.springframework.format.annotation.DateTimeFormat;

import com.soldesk.moa.users.entity.constant.UserGender;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@ToString
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Setter
@Getter
public class SignUpRequestDTO {

    @Email(message = "이메일 형식이 올바르지 않습니다.")
    @NotBlank
    private String email;

    @NotBlank
    @Pattern(regexp = "^[가-힣]{2,5}$", message = "이름은 2~5자 이내여야 합니다.")
    private String name;

    @NotBlank
    @Pattern(regexp = "^[가-힣a-zA-Z0-9]{2,10}$", message = "닉네임은 2~10자 이내여야 합니다.(공백, 특수문자 제외)")
    private String nickname;

    @NotBlank
    @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d)(?=.*[!@#$%^&*])[A-Za-z\\d!@#$%^&*]{8,20}$", message = "비밀번호는 영문, 숫자, 특수문자 포함 8-20자 이내여야 합니다.")
    private String password;

    @NotBlank(message = "주소를 입력해주세요.")
    private String address;

    @NotNull(message = "생년월일을 입력해주세요.")
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate birthDate;

    @NotBlank(message = "필수")
    @Pattern(regexp = "^01(?:0|1|[6-9])(?:-?\\d{3,4})-?\\d{4}$", message = "휴대폰 번호 형식이 올바르지 않습니다. 010-1234-5678")
    private String phone;

    private UserGender userGender;

    private int age;
}
