package com.soldesk.moa.users.entity;

import org.springframework.data.annotation.Id;

import com.soldesk.moa.common.entity.BaseEntity;
import com.soldesk.moa.common.entity.Image;

import jakarta.persistence.Column;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;

public class UserProfile extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userProfileId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private Users user;

    @Column(length = 100)
    private String statusMessage; // 상태 메시지

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_profile_image_id")
    private Image userProfileImage;

    @Column(length = 300)
    private String bio; // 한 줄 소개
}
