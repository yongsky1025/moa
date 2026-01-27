package com.soldesk.moa.admin.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.soldesk.moa.users.entity.Users;

import java.time.LocalDateTime;
import java.util.List;
import com.soldesk.moa.users.entity.constant.UserStatus;

public interface AdminUsersRepository extends JpaRepository<Users, Long>, SearchUsersRepository {

    // 현재 활동 중인 총 유저 수 & 남자 유저 (성비)
    @Query("select count(u.userId), count(case when u.userGender = 0 then 1 end) from Users u where u.userStatus = 'active'")
    Object[] getCountAllAndMale();

    // ?년 ?월 가입자 정보 조회
    @Query("select u from Users u where year(u.createDate) = ?1 and month(u.createDate) = ?2")
    List<Users> getListByCreateMonth(int year, int month);

    // userStatus 컬럼 추가 후 모임 가입x 멤버 조회(개발용)
    @Query("select u from Users u where not exists (select cm.user from CircleMember cm where cm.user = u)")
    List<Users> findUsersWithoutCircle();

    // soft delete 탈퇴자 정보조회
    List<Users> findByUserStatus(UserStatus userStatus);

    // 탈퇴자 수 조회(기간검색조회)
    @Query("select count(u) from Users u where u.userStatus = 'withdrawn' and u.withdrawnAt between :start and :end")
    Long getWithdrawnUsersCount(LocalDateTime start, LocalDateTime end);

    // 탈퇴자 정보 조회(기간검색조회)
    @Query("select u from Users u where u.userStatus = 'withdrawn' and u.withdrawnAt between :start and :end")
    List<Users> getWithdrawnUsersInfo(LocalDateTime start, LocalDateTime end);

    // 역대 월별 탈퇴자 수 조회
    @Query("select year(u.withdrawnAt), month(u.withdrawnAt), count(u)" +
            " from Users u where u.userStatus = 'withdrawn'" +
            " group by year(u.withdrawnAt), month(u.withdrawnAt)" +
            " order by year(u.withdrawnAt) desc, month(u.withdrawnAt) desc")
    List<Object[]> countWithdrawnGroupByMonth();

}
