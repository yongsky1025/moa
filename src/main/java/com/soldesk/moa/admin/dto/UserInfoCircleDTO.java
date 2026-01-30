package com.soldesk.moa.admin.dto;

import java.time.LocalDateTime;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserInfoCircleDTO {
    private String userName;
    private String circleName;
    private Integer currentMember;
    private LocalDateTime createDate;
    private String categoryName;
    private String role;
}
