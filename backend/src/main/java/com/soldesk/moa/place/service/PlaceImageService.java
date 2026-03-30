package com.soldesk.moa.place.service;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.soldesk.moa.common.entity.Image;
import com.soldesk.moa.common.entity.constant.ImageDomain;
import com.soldesk.moa.place.repository.PlaceImageRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PlaceImageService {

    private final PlaceImageRepository placeImageRepository;

    /** 여러 장소의 대표이미지 경로를 한 번에 조회 (placeId → imagePath) */
    public Map<Long, String> getRepresentativeImages(List<Long> placeIds) {
        if (placeIds.isEmpty()) return Map.of();
        return placeImageRepository.findRepresentativeImages(ImageDomain.PLACE, placeIds)
                .stream()
                .collect(Collectors.toMap(Image::getOwnerId, Image::getPath));
    }

    /** 장소 이미지 경로 목록 조회 (ord 오름차순) */
    public List<String> getPlaceImages(Long placeId) {
        return placeImageRepository.findByDomainAndOwnerIdAndDeletedFalse(ImageDomain.PLACE, placeId)
                .stream()
                .sorted(Comparator.comparingLong(Image::getOrd))
                .map(Image::getPath)
                .toList();
    }
}
