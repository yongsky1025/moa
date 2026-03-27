package com.soldesk.moa.board.entity.constant;

public enum BoardType {
    NOTICE, FREE, CIRCLE;

    public boolean isGlobal() {
        return this != CIRCLE;
    }
}
