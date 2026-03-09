package com.soldesk.moa.users.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.soldesk.moa.board.entity.Post;
import com.soldesk.moa.admin.temporary.Reply;
import com.soldesk.moa.circle.entity.CircleMember;
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
@ToString(exclude = { "images", "posts", "replies", "circleMembers" })
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

    @Column(nullable = false)
    private String password;

    @Column(nullable = false, unique = true)
    private String nickname;

    @Column(nullable = false)
    private String address;

    @Column(nullable = false)
    private LocalDate birthDate;

    @Column(nullable = false)
    private String phone;

    @Column(nullable = false)
    private int age;

    @Column(nullable = false)
    private UserGender userGender;

    @Enumerated(EnumType.STRING)
    private UserRole userRole;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private UserStatus userStatus = UserStatus.ACTIVE;

    private LocalDateTime withdrawnAt; // 탈퇴 시점 컬럼

    @OneToMany(mappedBy = "user")
    @Builder.Default
    private List<Image> images = new ArrayList<>();

    @OneToMany(mappedBy = "userId")
    @Builder.Default
    private List<Post> posts = new ArrayList<>();

    @OneToMany(mappedBy = "user")
    @Builder.Default
    private List<Reply> replies = new ArrayList<>();

    @OneToMany(mappedBy = "user")
    @Builder.Default
    private List<CircleMember> circleMembers = new ArrayList<>();

    public void changeNickname(String nickname) {
        this.nickname = nickname;
    }

    public void changeAddress(String address) {
        this.address = address;
    }

    public void changePassword(String password) {
        this.password = password;
    }

    // 탈퇴자 더미데이터 생성을 위한 메소드 (개발용)
    public void setUserStatus(UserStatus userStatus) {
        this.userStatus = userStatus;
    }

    public void withdraw() {
        this.userStatus = UserStatus.WITHDRAWN;
        this.withdrawnAt = LocalDateTime.now();
    }

    @PrePersist
    @PreUpdate
    public void addAge() {
        // 만 나이 계산
        LocalDate now = LocalDate.now();
        this.age = now.getYear() - birthDate.getYear();
        if (birthDate.getDayOfYear() > now.getDayOfYear()) {
            this.age--;
        }
    }

    // // birthDate , phone 컬럼 추가 후 db수정용 메소드(개발용)
    // public void setBirthDate(LocalDate birthDate) {
    // this.birthDate = birthDate;
    // }

    // // birthDate , phone 컬럼 추가 후 db수정용 메소드(개발용)
    // public void setPhone(String phone) {
    // this.phone = phone;
    // }

    // 기간별 가입자 조회를 위한 테스트 메소드(개발용)
    // @Override
    // public void setCreateDate(LocalDateTime createDate) {
    // super.setCreateDate(createDate);
    // }
}
