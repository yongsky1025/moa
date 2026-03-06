package com.soldesk.moa.admin.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.soldesk.moa.users.entity.Users;

public interface AdminRepository extends JpaRepository<Users, Long> {

}
