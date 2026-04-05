package com.soldesk.moa.users.dto.energyprofile;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ImportGuestTokenRequestDTO {

    @NotBlank(message = "guestToken은 필수입니다.")
    private String guestToken;
}
