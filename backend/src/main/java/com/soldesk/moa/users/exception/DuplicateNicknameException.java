package com.soldesk.moa.users.exception;

public class DuplicateNicknameException extends RuntimeException {
    public DuplicateNicknameException() {
        super("DUPLICATE_NICKNAME");
    }
}
