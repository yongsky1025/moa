package com.soldesk.moa.users.entity;

import java.util.ArrayList;
import java.util.List;

import com.soldesk.moa.admin.temporary.Board;
import com.soldesk.moa.admin.temporary.Reply;
import com.soldesk.moa.circle.entity.CircleMember;
import com.soldesk.moa.common.entity.BaseEntity;
import com.soldesk.moa.common.entity.Image;
import com.soldesk.moa.users.entity.constant.UserGender;
import com.soldesk.moa.users.entity.constant.UserRole;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
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
@ToString(exclude = { "images", "boards", "replies", "circleMembers" })
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

    @Enumerated(EnumType.STRING)
    private UserRole userRole;

    @Column(nullable = false)
    private UserGender userGender;

    @OneToMany(mappedBy = "user")
    @Builder.Default
    private List<Image> images = new ArrayList<>();

    @OneToMany(mappedBy = "user")
    @Builder.Default
    private List<Board> boards = new ArrayList<>();

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
}
