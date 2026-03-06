package com.soldesk.moa.users.handler;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.soldesk.moa.users.exception.DuplicateNicknameException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(DuplicateNicknameException.class)
    public ResponseEntity<?> handleDuplicateNickname() {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of("error", "이미 사용 중인 닉네임입니다."));
    }
}
