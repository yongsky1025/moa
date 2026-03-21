package com.soldesk.moa.board.exception;

// 타입 이상 (notice, free, circle 등)
public class InvalidBoardTypeException extends RuntimeException {
    public InvalidBoardTypeException(String msg) {
        super(msg);
    }
}