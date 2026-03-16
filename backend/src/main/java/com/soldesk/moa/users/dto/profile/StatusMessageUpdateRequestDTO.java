package com.soldesk.moa.users.dto.profile;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class StatusMessageUpdateRequestDTO {

    @Size(max = 100, message = "상태 메시지는 100자 이내여야 합니다.")
    private String statusMessage;
}
