package com.soldesk.moa.admin.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.soldesk.moa.circle.entity.Circle;

public interface AdminCircleRepository extends JpaRepository<Circle, Long>, SearchCircleRepository {

    @Query("select c from Circle c where year(c.createDate) = ?1 and month(c.createDate) = ?2")
    List<Circle> getListByCreateMonth(int year, int month);

    @Query("select cc.categoryName, count(c.circleId) from Circle c join CircleCategory cc on c.category = cc group by cc.categoryName")
    List<Object[]> getCircleByCategory();

}
