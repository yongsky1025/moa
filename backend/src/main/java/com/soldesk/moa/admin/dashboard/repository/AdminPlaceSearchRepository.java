package com.soldesk.moa.admin.dashboard.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.soldesk.moa.admin.dashboard.dto.placeInfo.AdminPlaceSearchDTO;
import com.soldesk.moa.place.entity.Place;

public interface AdminPlaceSearchRepository {

    Page<Place> searchAdminPlaces(AdminPlaceSearchDTO searchDTO, Pageable pageable);
}
