package com.soldesk.moa.users.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

import com.soldesk.moa.users.dto.CurrentUserResponseDTO;
import com.soldesk.moa.users.entity.Users;
import com.soldesk.moa.users.repository.UsersRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@RequiredArgsConstructor
@Log4j2
@Controller
public class UserController {

    private final UsersRepository usersRepository;

    @GetMapping("/user/overview")
    public ResponseEntity<?> mypage(Authentication auth) {
        Users user = usersRepository.findByEmail(auth.getName()).orElseThrow();

        return ResponseEntity.ok(new CurrentUserResponseDTO(user));
    }
}
