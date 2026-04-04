package com.soldesk.moa.place.repository;

import java.util.List;

import com.soldesk.moa.place.dto.PlaceSearchDTO;
import com.soldesk.moa.place.entity.Place;

public interface PlaceSearchRepository {

    List<Place> searchPlaces(PlaceSearchDTO searchDTO);
}
