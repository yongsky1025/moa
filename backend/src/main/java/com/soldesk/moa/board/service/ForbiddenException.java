package com.soldesk.moa.board.service;

public class ForbiddenException extends RuntimeException {
    public ForbiddenException(String msg) {
        super(msg);
    }
}
