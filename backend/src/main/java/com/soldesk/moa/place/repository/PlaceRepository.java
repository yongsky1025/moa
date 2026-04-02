package com.soldesk.moa.place.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.soldesk.moa.admin.dashboard.repository.AdminPlaceSearchRepository;
import com.soldesk.moa.place.entity.Place;

public interface PlaceRepository extends JpaRepository<Place, Long>, AdminPlaceSearchRepository, PlaceSearchRepository {

    @Query("SELECT DISTINCT p FROM Place p LEFT JOIN FETCH p.tags pt LEFT JOIN FETCH pt.tag")
    List<Place> findAllWithTags();

    @Query("SELECT DISTINCT p FROM Place p LEFT JOIN FETCH p.reviews")
    List<Place> findAllWithReviews();

    @Query("SELECT DISTINCT p FROM Place p LEFT JOIN FETCH p.tags pt LEFT JOIN FETCH pt.tag WHERE p.id IN :ids")
    List<Place> findByIdsWithTags(@Param("ids") List<Long> ids);
}
