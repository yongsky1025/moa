package com.soldesk.moa.image.entity;

import java.time.LocalDateTime;

import com.soldesk.moa.users.entity.Users;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Table(name = "image")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = { "user" })
public class Image {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long imageId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String uuid;

    @Column(nullable = false)
    private String path;

    @Column(length = 20)
    private String extension;

    @Column(length = 255)
    private String mimeType;

    @Column(nullable = false)
    private long fileSize;

    @Column(nullable = false)
    private Long ord;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    private Users user;

    @Column(length = 100)
    private String tempKey;

    @Column(nullable = false)
    private boolean temporary;

    @Column(nullable = false)
    private LocalDateTime uploadedAt;

    public void markTemporary(String tempKey) {
        this.tempKey = tempKey;
        this.temporary = true;
    }

    public void markPermanent() {
        this.temporary = false;
    }

}
