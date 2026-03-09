package com.soldesk.moa.users.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class AddressUpdateRequestDTO {

    @NotBlank(message = "주소를 입력해주세요.")
    private String address;
}
