package com.soldesk.moa.users.service;

import com.soldesk.moa.users.dto.UserCreateRequestDTO;
import com.soldesk.moa.users.entity.Users;
import com.soldesk.moa.users.entity.constant.UserRole;
import com.soldesk.moa.users.repository.UsersRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UsersService {

    private final UsersRepository usersRepository;

    public Users createUser(UserCreateRequestDTO dto) {
        Users user = Users.builder()
                .name(dto.getName())
                .email(dto.getEmail())
                .password(dto.getPassword())
                .nickname(dto.getNickname())
                .address(dto.getAddress())
                .userRole(UserRole.USER)
                .build();

        return usersRepository.save(user);
    }
}
