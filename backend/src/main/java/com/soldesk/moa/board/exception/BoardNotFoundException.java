package com.soldesk.moa.board.exception;

public class BoardNotFoundException extends RuntimeException {
    public BoardNotFoundException(String msg) {
        super(msg);
    }
}