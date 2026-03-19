package com.soldesk.moa.users.entity;

import com.soldesk.moa.users.entity.constant.AuthProvider;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

// import com.soldesk.moa.board.entity.Board;

import com.soldesk.moa.board.entity.Post;
import com.soldesk.moa.board.entity.Reply;
import com.soldesk.moa.circle.entity.CircleMember;
import com.soldesk.moa.common.entity.BaseEntity;
import com.soldesk.moa.common.entity.Image;
import com.soldesk.moa.users.entity.constant.UserGender;
import com.soldesk.moa.users.entity.constant.UserRole;
import com.soldesk.moa.users.entity.constant.UserStatus;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@ToString(exclude = { "images", "posts", "replies", "energyProfile" })
@Table(name = "users")
@Entity
public class Users extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = true)
    private String password;

    @Column(nullable = false, unique = true)
    private String nickname;

    @Column(nullable = true)
    private LocalDate birthDate;

    @Column(nullable = true)
    private int age;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole userRole;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserGender userGender;

    @Enumerated(EnumType.STRING)
    private AuthProvider provider;

    private String providerId;

    // 사용자 공개용 id (프론트/API용 id - 보안)
    @Column(name = "public_id", nullable = false, unique = true, length = 36)
    private String publicId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private UserStatus userStatus = UserStatus.ACTIVE;

    // === 추가된 필드 ===

    // 개인정보 동의 시점 (가입 시 필수, 소셜은 추가정보 입력 시 설정)
    @Column(nullable = true)
    private LocalDateTime privacyAgreedAt;

    // 온보딩(에너지 프로필) 완료 시점 (null이면 미완료)
    private LocalDateTime onboardingCompletedAt;

    // 상태 메시지
    @Column(name = "status_message", length = 100)
    private String statusMessage;

    // 에너지 프로필 (1:1)
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private UsersEnergyProfile energyProfile;

    @OneToMany(mappedBy = "user")
    @Builder.Default
    private List<Image> images = new ArrayList<>();

    @OneToMany(mappedBy = "userId")
    @Builder.Default
    private List<Post> posts = new ArrayList<>();

    @OneToMany(mappedBy = "userId")
    @Builder.Default
    private List<Reply> replies = new ArrayList<>();

    // 회원 탈퇴(withdrawn) 일시
    private LocalDateTime withdrawnAt;

    // === 메서드 ===

    public void changeNickname(String nickname) {
        this.nickname = nickname;
    }

    public void changeStatusMessage(String statusMessage) {
        this.statusMessage = statusMessage;
    }

    public void changePassword(String password) {
        this.password = password;
    }

    public void changePublicId(String publicId) {
        this.publicId = publicId;
    }

    public void changeProvider(AuthProvider provider) {
        this.provider = provider;
    }

    public void changeProviderId(String providerId) {
        this.providerId = providerId;
    }

    // 탈퇴/복구
    public void changeUserStatus(UserStatus userStatus) {
        this.userStatus = userStatus;
    }

    // 탈퇴 시점 DB 삽입
    // 탈퇴자 더미데이터 생성을 위한 메소드 (개발용)
    public void setUserStatus(UserStatus userStatus) {
        this.userStatus = userStatus;
    }

    public void withdraw() {
        this.userStatus = UserStatus.WITHDRAWN;
        this.withdrawnAt = LocalDateTime.now();
    }

    public void completeOnboarding() {
        this.onboardingCompletedAt = LocalDateTime.now();
    }

    // 소셜 회원가입 추가정보 완료
    public void completeSocialSignUp(LocalDate birthDate, UserGender userGender) {
        this.birthDate = birthDate;
        this.userGender = userGender;
        this.privacyAgreedAt = LocalDateTime.now();
    }

    @PrePersist
    @PreUpdate
    public void addAge() {
        // publicId 초기화 (최초 저장 시에만 생성)
        if (this.publicId == null) {
            this.publicId = UUID.randomUUID().toString();
        }
        if (birthDate == null) {
            return;
        }
        // 만 나이 계산
        LocalDate now = LocalDate.now();
        this.age = now.getYear() - birthDate.getYear();
        if (birthDate.getDayOfYear() > now.getDayOfYear()) {
            this.age--;
        }
    }

}
