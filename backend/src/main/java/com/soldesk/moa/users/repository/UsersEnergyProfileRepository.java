package com.soldesk.moa.users.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.soldesk.moa.users.entity.UsersEnergyProfile;

public interface UsersEnergyProfileRepository extends JpaRepository<UsersEnergyProfile, Long> {
}
