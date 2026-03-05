package com.soldesk.moa.users.entity;

import com.soldesk.moa.users.entity.constant.AuthProvider;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

// import com.soldesk.moa.board.entity.Board;
import com.soldesk.moa.common.entity.BaseEntity;
import com.soldesk.moa.common.entity.Image;
import com.soldesk.moa.users.entity.constant.UserGender;
import com.soldesk.moa.users.entity.constant.UserRole;
import com.soldesk.moa.users.entity.constant.UserStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
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
@ToString(exclude = { "images" })
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
    private String address;

    @Column(nullable = true)
    private LocalDate birthDate;

    @Column(nullable = true)
    private String phone;

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

    // 사용자 id(공개용) - 회원 가입 시 entity에서 자동으로 생성
    @PrePersist
    public void prePersist() {
        if (this.publicId == null) {
            this.publicId = UUID.randomUUID().toString();
        }
    }

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private UserStatus userStatus = UserStatus.ACTIVE;

    @OneToMany(mappedBy = "user")
    @Builder.Default
    private List<Image> images = new ArrayList<>();

    // 임시로 보류
    // @OneToMany(mappedBy = "")
    // @Builder.Default
    // private List<Board> boards = new ArrayList<>();

    // // 작성한 게시글 추가
    // @OneToMany(mappedBy = "")
    // @Builder.Default
    // private List<Post> posts = new ArrayList<>();

    // 회원 탈퇴(withdrawn) 일시
    private LocalDateTime withdrawnAt;

    public void changeNickname(String nickname) {
        this.nickname = nickname;
    }

    public void changeAddress(String address) {
        this.address = address;
    }

    public void changePassword(String password) {
        this.password = password;
    }

    public void changePhone(String phone) {
        this.phone = phone;
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
    public void withdraw() {
        this.userStatus = UserStatus.WITHDRAWN;
        this.withdrawnAt = LocalDateTime.now();
    }

    @PrePersist
    @PreUpdate
    public void addAge() {
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
