package com.soldesk.moa.common.exception;

public class UserNotActiveException extends RuntimeException {
    private final String errorCode;

    public UserNotActiveException(String errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
    }

    public String getErrorCode() {
        return errorCode;
    }
}
