package com.soldesk.moa.admin.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.soldesk.moa.users.entity.Users;
import java.util.List;

public interface AdminRepository extends JpaRepository<Users, Long> {

    @Query("select count(u.userId), count(case when u.userGender = 0 then 1 end) from Users u")
    Object[] getCountAllAndMale();

    @Query("select u from Users u where year(u.createDate) = ?1 and month(u.createDate) = ?2")
    List<Users> getListByCreateMonth(int year, int month);
}
