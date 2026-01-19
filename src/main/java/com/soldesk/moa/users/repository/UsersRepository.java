package com.soldesk.moa.users.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.soldesk.moa.users.entity.Users;

public interface UsersRepository extends JpaRepository<Users, Long> {

}
