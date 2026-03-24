package com.soldesk.moa.reply.exception;

public class ReplyDepthExceededException extends RuntimeException {
    public ReplyDepthExceededException(String msg) {
        super(msg);
    }
}
