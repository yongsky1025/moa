package com.soldesk.moa.admin.log.dto;

import java.time.LocalDateTime;

import com.soldesk.moa.common.dto.PageRequestDTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class LogDTO extends PageRequestDTO {
    private Long id;

    private Long actorId;

    private String targetType;

    private Long targetId;

    private String actionType;

    private String methodName;

    private String requestUrl;

    private LocalDateTime timestamp;
}
