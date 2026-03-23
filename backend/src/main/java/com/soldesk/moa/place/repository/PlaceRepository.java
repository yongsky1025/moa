package com.soldesk.moa.place.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.soldesk.moa.place.entity.Place;

public interface PlaceRepository extends JpaRepository<Place, Long> {

    @Query("SELECT DISTINCT p FROM Place p LEFT JOIN FETCH p.tags pt LEFT JOIN FETCH pt.tag LEFT JOIN FETCH p.reviews")
    List<Place> findAllWithTagsAndReviews();
}
