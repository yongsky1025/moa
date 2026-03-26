package com.soldesk.moa.place.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.soldesk.moa.place.entity.Place;
import com.soldesk.moa.place.entity.PlaceTag;

public interface PlaceTagRepository extends JpaRepository<PlaceTag, Long> {

    void deleteAllByPlace(Place place);
}
