package com.soldesk.moa.place.entity;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

import com.soldesk.moa.common.entity.BaseEntity;
import com.soldesk.moa.place.entity.constant.PlaceStatus;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
    private String address;

    @Column(nullable = false)
    private String city;

    @Column(nullable = false)
    private String district;

    @Column
    private String dong;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    @Column(nullable = false)
    private Integer capacity;

    @Column(nullable = false)
    private Integer pricePerHour;

    @Column(nullable = false, columnDefinition = "LONGTEXT")
    private String description;

    @Column(nullable = false)
    private Integer minReservationMinutes;

    @Column(nullable = false)
    private Integer maxReservationMinutes;

    @Column(nullable = false)
    private LocalTime openTime;

    @Column(nullable = false)
    private LocalTime closeTime;

    @Builder.Default
    private Double averageRating = 0.0;

    @Builder.Default
    private Integer reviewCount = 0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private PlaceStatus status = PlaceStatus.ACTIVE;

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

    public void setName(String name) { this.name = name; }
    public void setAddress(String address) { this.address = address; }
    public void setCity(String city) { this.city = city; }
    public void setDistrict(String district) { this.district = district; }
    public void setDong(String dong) { this.dong = dong; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }
    public void setPricePerHour(Integer pricePerHour) { this.pricePerHour = pricePerHour; }
    public void setDescription(String description) { this.description = description; }
    public void setMinReservationMinutes(Integer minReservationMinutes) { this.minReservationMinutes = minReservationMinutes; }
    public void setMaxReservationMinutes(Integer maxReservationMinutes) { this.maxReservationMinutes = maxReservationMinutes; }
    public void setOpenTime(LocalTime openTime) { this.openTime = openTime; }
    public void setCloseTime(LocalTime closeTime) { this.closeTime = closeTime; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    public void setTags(List<PlaceTag> tags) { this.tags = tags; }
    public void setPlaceClosedDays(List<PlaceClosedDay> placeClosedDays) { this.placeClosedDays = placeClosedDays; }
    public void setStatus(PlaceStatus status) { this.status = status; }

    public void updateRatingOnAdd(int newRating) {
        this.averageRating = (this.averageRating * this.reviewCount + newRating) / (this.reviewCount + 1);
        this.reviewCount = this.reviewCount + 1;
    }

    public void updateRatingOnDelete(int deletedRating) {
        if (this.reviewCount <= 1) {
            this.averageRating = 0.0;
            this.reviewCount = 0;
        } else {
            this.averageRating = (this.averageRating * this.reviewCount - deletedRating) / (this.reviewCount - 1);
            this.reviewCount = this.reviewCount - 1;
        }
    }

    public void updateRatingOnEdit(int oldRating, int newRating) {
        this.averageRating = (this.averageRating * this.reviewCount - oldRating + newRating) / this.reviewCount;
    }
}
