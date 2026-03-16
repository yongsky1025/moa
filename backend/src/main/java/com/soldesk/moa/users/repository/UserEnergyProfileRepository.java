package com.soldesk.moa.users.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.soldesk.moa.users.entity.Users;
import com.soldesk.moa.users.entity.UsersEnergyProfile;

public interface UserEnergyProfileRepository extends JpaRepository<UsersEnergyProfile, Long> {

    Optional<UsersEnergyProfile> findByUser(Users user);

    Optional<UsersEnergyProfile> findByUserUserId(Long userId);

    boolean existsByUser(Users user);
}