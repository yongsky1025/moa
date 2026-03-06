package com.soldesk.moa.common.exception;

public class UserNotActiveException extends RuntimeException {
    public UserNotActiveException(String message) {
        super(message);
    }
}
