package com.soldesk.moa.users.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PasswordDTO {

    private String email;
    private String currentPassword;
    private String newPassword;
}
