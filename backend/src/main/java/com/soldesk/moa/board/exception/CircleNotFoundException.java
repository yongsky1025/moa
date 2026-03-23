package com.soldesk.moa.board.exception;

public class CircleNotFoundException extends RuntimeException {
    public CircleNotFoundException(Long id) {
        super("[#BOARD] 써클을 찾을 수 없습니다. id=" + id);
    }
}
