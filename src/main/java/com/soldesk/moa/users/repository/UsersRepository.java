package com.soldesk.moa.users.repository;

import com.soldesk.moa.users.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UsersRepository extends JpaRepository<Users, Long> {
}
