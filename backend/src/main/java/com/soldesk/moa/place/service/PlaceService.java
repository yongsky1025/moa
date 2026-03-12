package com.soldesk.moa.place.service;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.soldesk.moa.place.dto.PlaceCreateDTO;
import com.soldesk.moa.place.dto.PlaceResponseDTO;
import com.soldesk.moa.place.entity.Place;
import com.soldesk.moa.place.entity.PlaceClosedDay;
import com.soldesk.moa.place.entity.PlaceTag;
import com.soldesk.moa.place.entity.Tag;
import com.soldesk.moa.place.entity.constant.ClosedType;
import com.soldesk.moa.place.repository.PlaceClosedDayRepository;
import com.soldesk.moa.place.repository.PlaceRepository;
import com.soldesk.moa.place.repository.PlaceTagRepository;
import com.soldesk.moa.place.repository.TagRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Service
@Transactional
@RequiredArgsConstructor
@Log4j2
public class PlaceService {

    private final PlaceRepository placeRepository;
    private final TagRepository tagRepository;
    private final PlaceTagRepository placeTagRepository;
    private final PlaceClosedDayRepository placeClosedDayRepository;

    // 장소 생성
    public Long createPlace(PlaceCreateDTO dto) {

        // string -> localtime
        LocalTime openTime = LocalTime.of(dto.openTimeHour(), dto.openTimeMinute());
        LocalTime closeTime = LocalTime.of(dto.closeTimeHour(), dto.closeTimeMinute());

        if (openTime.isAfter(closeTime)) {
            throw new IllegalArgumentException("운영시간이 올바르지 않음");
        }

        Place place = Place.builder()
                .name(dto.name())
                .address(dto.address())
                .city(dto.city())
                .district(dto.district())
                .latitude(dto.latitude())
                .longitude(dto.longitude())
                .capacity(dto.capacity())
                .pricePerHour(dto.pricePerHour())
                .description(dto.description())
                .openTime(openTime)
                .closeTime(closeTime)
                .minReservationHour(dto.minReservationHour())
                .maxReservationHour(dto.maxReservationHour())
                .build();

        placeRepository.save(place);

        List<Tag> tags = tagRepository.findAllById(dto.tagIds());

        List<PlaceTag> placeTags = tags.stream()
                .map(tag -> PlaceTag.builder()
                        .place(place)
                        .tag(tag)
                        .build())
                .toList();

        placeTagRepository.saveAll(placeTags);

        List<PlaceClosedDay> closedDays = dto.placeClosedDays().stream()
                .map(day -> PlaceClosedDay.builder()
                        .place(place)
                        .dayOfWeek(day.dayOfWeek())
                        .date(day.date())
                        .reason(day.reason())
                        .closedType(ClosedType.valueOf(day.closedType()))
                        .build())
                .toList();

        placeClosedDayRepository.saveAll(closedDays);

        return place.getId();
    }

    // 장소 조회(하나)
    @Transactional(readOnly = true)
    public PlaceResponseDTO getPlace(Long id) {

        Place place = placeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("place not found"));

        return PlaceResponseDTO.builder()
                .id(place.getId())
                .name(place.getName())
                .address(place.getAddress())
                .city(place.getCity())
                .district(place.getDistrict())
                .capacity(place.getCapacity())
                .pricePerHour(place.getPricePerHour())
                .build();
    }

    // 장소 전체 조회(페이징 아직)
    @Transactional(readOnly = true)
    public List<PlaceResponseDTO> getAllPlaces() {

        return placeRepository.findAll()
                .stream()
                .map(place -> PlaceResponseDTO.builder()
                        .id(place.getId())
                        .name(place.getName())
                        .address(place.getAddress())
                        .city(place.getCity())
                        .district(place.getDistrict())
                        .capacity(place.getCapacity())
                        .pricePerHour(place.getPricePerHour())
                        .build())
                .toList();
    }

    // 수정(변경가능성o) , 태그 및 기타 수정은 나중에...
    public Long updatePlace(Long id, PlaceCreateDTO dto) {
        Place place = placeRepository.findById(id).orElseThrow(() -> new RuntimeException("place not found"));

        place.setAddress(dto.address());
        place.setCapacity(dto.capacity());
        place.setCity(dto.city());
        place.setDescription(dto.description());
        place.setDistrict(dto.district());
        place.setMaxReservationHour(dto.maxReservationHour());
        place.setName(dto.name());
        place.setPricePerHour(dto.pricePerHour());

        return place.getId();
    }

    // 삭제
    public void deletePlace(Long id) {
        placeRepository.deleteById(id);
    }
}
