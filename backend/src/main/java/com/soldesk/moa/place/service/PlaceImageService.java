package com.soldesk.moa.place.service;

import java.util.Comparator;
import java.util.List;

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

    /** 장소 이미지 경로 목록 조회 (ord 오름차순) */
    public List<String> getPlaceImages(Long placeId) {
        return placeImageRepository.findByDomainAndOwnerIdAndDeletedFalse(ImageDomain.PLACE, placeId)
                .stream()
                .sorted(Comparator.comparingLong(Image::getOrd))
                .map(Image::getPath)
                .toList();
    }
}
