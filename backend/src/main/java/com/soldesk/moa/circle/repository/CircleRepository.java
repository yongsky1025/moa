package com.soldesk.moa.circle.repository;

<<<<<<< HEAD
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import com.soldesk.moa.circle.entity.Circle;

public interface CircleRepository extends JpaRepository<Circle, Long> {
    // 카테고리별 서클 조회
    List<Circle> findByCategory_CategoryId(Long categoryId);
=======
import org.springframework.data.jpa.repository.JpaRepository;
import com.soldesk.moa.circle.entity.Circle;

public interface CircleRepository extends JpaRepository<Circle, Long>, CircleRepositoryCustom {
>>>>>>> 942169c7c64477b9ae3b33cbb6aa4ac1d2b95d58
}
