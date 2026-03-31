package com.soldesk.moa.users.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import com.soldesk.moa.users.entity.Users;
import com.soldesk.moa.users.entity.constant.UserRole;

public interface UsersRepository extends JpaRepository<Users, Long> {

    boolean existsByEmail(String email);

    boolean existsByNickname(String nickname);

    Optional<Users> findByEmail(String email);

    List<Users> findAllByUserRole(UserRole userRole);

    @Modifying
    @Transactional
    @Query("UPDATE Users u SET u.userProfileImage = null WHERE u.userProfileImage IS NOT NULL")
    void clearAllProfileImages();

}
