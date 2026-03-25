package com.soldesk.moa.common.exception;

import org.apache.coyote.BadRequestException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.soldesk.moa.board.exception.BoardNotFoundException;
import com.soldesk.moa.board.exception.CircleBoardCreationNotAllowedException;
import com.soldesk.moa.board.exception.CircleNotFoundException;
import com.soldesk.moa.board.exception.GlobalBoardTypeInvalidException;
import com.soldesk.moa.board.exception.InvalidBoardTypeException;
import com.soldesk.moa.board.exception.MissingCircleIdException;
import com.soldesk.moa.post.exception.PostForbiddenException;
import com.soldesk.moa.post.exception.PostNotFoundException;
import com.soldesk.moa.reply.exception.ReplyDepthExceededException;
import com.soldesk.moa.reply.exception.ReplyForbiddenException;
import com.soldesk.moa.reply.exception.ReplyNotFoundException;

@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(BoardNotFoundException.class)
    public ResponseEntity<?> handleBoardNotFound(BoardNotFoundException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
    }

    @ExceptionHandler(CircleNotFoundException.class)
    public ResponseEntity<?> handleCircleNotFound(CircleNotFoundException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
    }

    @ExceptionHandler(InvalidBoardTypeException.class)
    public ResponseEntity<?> handleInvalidBoardType(InvalidBoardTypeException e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
    }

    @ExceptionHandler(GlobalBoardTypeInvalidException.class)
    public ResponseEntity<?> handleGlobalBoardTypeInvalid(GlobalBoardTypeInvalidException e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
    }

    @ExceptionHandler(CircleBoardCreationNotAllowedException.class)
    public ResponseEntity<?> handleCircleBoardCreationNotAllowed(CircleBoardCreationNotAllowedException e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
    }

    @ExceptionHandler(MissingCircleIdException.class)
    public ResponseEntity<?> handleMissingCircleId(MissingCircleIdException e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
    }

    @ExceptionHandler(PostNotFoundException.class)
    public ResponseEntity<?> handlePostNotFound(PostNotFoundException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
    }

    @ExceptionHandler(PostForbiddenException.class)
    public ResponseEntity<?> handlePostForbidden(PostForbiddenException e) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
    }

    @ExceptionHandler(ReplyNotFoundException.class)
    public ResponseEntity<?> handleReplyNotFound(ReplyNotFoundException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
    }

    @ExceptionHandler(ReplyForbiddenException.class)
    public ResponseEntity<?> handleReplyForbidden(ReplyForbiddenException e) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
    }

    @ExceptionHandler(ReplyDepthExceededException.class)
    public ResponseEntity<?> handleReplyDepthExceeded(ReplyDepthExceededException e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<?> handleBadRequest(BadRequestException e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
    }
}
