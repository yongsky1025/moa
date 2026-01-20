package com.soldesk.moa.users.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import com.soldesk.moa.users.entity.Users;

public interface UsersRepository extends JpaRepository<Users, Long> {

    boolean existsByEmail(String email);

    boolean existsByNickname(String nickname);

    Optional<Users> findByEmail(String email);

    // 닉네임 변경
    @Modifying
    @Query("UPDATE Users u SET u.nickname=:nickname where u.email=:email")
    void updateNickname(String nickname, String email);

}
