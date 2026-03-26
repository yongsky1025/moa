package com.soldesk.moa.common.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ErrorResponseDTO {
    private int status;
    private String error;
    private String message;
    private String errorCode;

    public ErrorResponseDTO(int status, String error, String message) {
        this(status, error, message, null);
    }
}
