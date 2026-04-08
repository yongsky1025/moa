package com.soldesk.moa.place.entity;

import com.soldesk.moa.common.entity.BaseEntity;
import com.soldesk.moa.users.entity.Users;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Table(uniqueConstraints = {
        @UniqueConstraint(columnNames = { "reservation_id", "user_id" })
})
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = { "place", "reviewer" })
public class PlaceReview extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Integer rating;

    @Column(nullable = false)
    @Lob
    private String comment;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "place_id")
    private Place place;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private Users reviewer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reservation_id")
    private Reservation reservation;

    @Column(nullable = false)
    @Builder.Default
    private boolean deleted = false;

    public void update(int rating, String comment) {
        this.rating = rating;
        this.comment = comment;
    }

    public void markDeleted() {
        this.deleted = true;
    }

    public void restore() {
        this.deleted = false;
    }
}
