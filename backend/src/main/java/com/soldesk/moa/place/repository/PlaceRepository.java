package com.soldesk.moa.place.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.soldesk.moa.place.entity.Place;

public interface PlaceRepository extends JpaRepository<Place, Long> {

}
