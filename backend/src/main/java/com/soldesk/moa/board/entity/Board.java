package com.soldesk.moa.board.entity;

import java.util.ArrayList;
import java.util.List;

import com.soldesk.moa.board.entity.constant.BoardType;
import com.soldesk.moa.circle.entity.Circle;
import com.soldesk.moa.common.entity.BaseEntity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
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
@ToString(exclude = { "circleId", "posts" })
@Table
@Entity
public class Board extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long boardId;

    @Enumerated(EnumType.STRING)
    private BoardType boardType; // GLOBAL,CIRCLE

    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "circle_id", nullable = true)
    private Circle circleId;

    // setter
    // 이름변경
    public void changeName(String name) {
        this.name = name;
    }

    // // board -> post 삭제
    @OneToMany(mappedBy = "boardId", cascade = CascadeType.REMOVE, orphanRemoval = true)
    @Builder.Default
    private List<Post> posts = new ArrayList<>();

}
