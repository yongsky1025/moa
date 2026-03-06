package com.soldesk.moa.repository.board;

import java.util.stream.IntStream;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.Rollback;

import com.soldesk.moa.circle.entity.Circle;
import com.soldesk.moa.circle.entity.CircleCategory;
import com.soldesk.moa.circle.entity.constant.CircleStatus;
import com.soldesk.moa.circle.repository.CircleRepository;

import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;

@Disabled
@SpringBootTest
@Transactional
@Rollback(false)
public class CircleRepositoryTest {

    @Autowired
    private CircleRepository circleRepository;

    @Autowired
    private EntityManager entityManager;

    @Test
    public void insertCircles() {
        CircleCategory category = CircleCategory.builder()
                .categoryName("test-category")
                .build();
        entityManager.persist(category);

        IntStream.rangeClosed(1, 20).forEach(i -> {
            Circle circle = Circle.builder()
                    .name("circle-" + i)
                    .description("test circle " + i)
                    .status(CircleStatus.OPEN)
                    .maxMember(30)
                    .currentMember(0)
                    .category(category)
                    .build();
            circleRepository.save(circle);
        });

        entityManager.flush();
    }
}
