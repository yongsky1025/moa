package com.soldesk.moa.users.service;

import org.springframework.stereotype.Service;

import com.soldesk.moa.users.repository.UsersRepository;

import lombok.RequiredArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import lombok.extern.log4j.Log4j2;

@RequiredArgsConstructor
@Setter
@Log4j2
@ToString
@Service
public class UsersService {

    private final UsersRepository usersRepository;

}
