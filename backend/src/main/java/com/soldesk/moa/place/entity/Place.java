package com.soldesk.moa.place.entity;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

import com.soldesk.moa.common.entity.BaseEntity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.OneToMany;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = { "tags", "reviews", "reservations", "placeClosedDays" })
public class Place extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String address; // 상세주소

    @Column(nullable = false)
    private String city; // 지역

    @Column(nullable = false)
    private String district; // 구, 시

    @Column(nullable = false)
    private Double latitude; // 위도

    @Column(nullable = false)
    private Double longitude; // 경도

    @Column(nullable = false)
    private Integer capacity; // 수용 인원

    @Column(nullable = false)
    private Integer pricePerHour; // 시간당 가격

    @Column(nullable = false)
    @Lob
    private String description; // 장소에 대한 설명(상세 페이지에서 사용, 물론 ai기반 추천도 가능)

    @Column(nullable = false)
    private Integer minReservationHour; // 최소 예약 시간

    @Column(nullable = false)
    private Integer maxReservationHour; // 최대 예약시간

    @Column(nullable = false)
    private LocalTime openTime; // 장소 오픈 시간

    @Column(nullable = false)
    private LocalTime closeTime; // 장소 클로즈 시간

    @OneToMany(mappedBy = "place")
    @Builder.Default
    private List<PlaceTag> tags = new ArrayList<>();

    @OneToMany(mappedBy = "place", cascade = CascadeType.REMOVE)
    @Builder.Default
    private List<PlaceReview> reviews = new ArrayList<>();

    @OneToMany(mappedBy = "place")
    @Builder.Default
    private List<Reservation> reservations = new ArrayList<>();

    @OneToMany(mappedBy = "place", cascade = CascadeType.REMOVE)
    @Builder.Default
    private List<PlaceClosedDay> placeClosedDays = new ArrayList<>();

    public void setName(String name) {
        this.name = name;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public void setDistrict(String district) {
        this.district = district;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public void setPricePerHour(Integer pricePerHour) {
        this.pricePerHour = pricePerHour;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setMinReservationHour(Integer minReservationHour) {
        this.minReservationHour = minReservationHour;
    }

    public void setMaxReservationHour(Integer maxReservationHour) {
        this.maxReservationHour = maxReservationHour;
    }

    public void setOpenTime(LocalTime openTime) {
        this.openTime = openTime;
    }

    public void setCloseTime(LocalTime closeTime) {
        this.closeTime = closeTime;
    }

    public void setTags(List<PlaceTag> tags) {
        this.tags = tags;
    }

    public void setPlaceClosedDays(List<PlaceClosedDay> placeClosedDays) {
        this.placeClosedDays = placeClosedDays;
    }

}
