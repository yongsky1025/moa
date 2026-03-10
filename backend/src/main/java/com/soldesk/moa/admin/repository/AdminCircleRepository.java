package com.soldesk.moa.admin.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.soldesk.moa.circle.entity.Circle;

public interface AdminCircleRepository extends JpaRepository<Circle, Long>, SearchCircleRepository {

    @Query("select c from Circle c where year(c.createDate) = ?1 and month(c.createDate) = ?2")
    List<Circle> getListByCreateMonth(int year, int month);

    // 카테고리별 모임 분포 확인
    @Query("select cc.categoryName, count(c.circleId) from Circle c join CircleCategory cc on c.category = cc group by cc.categoryName")
    List<Object[]> getCircleByCategory();

    // 전체 모임 중 인원이 max에 도달한 모임 정보, 수(인원 순 정렬로 인기 순 파악 가능)
    @Query("select c from Circle c where c.currentMember = c.maxMember order by c.currentMember")
    List<Circle> getMaxList();
}
