package com.soldesk.moa.board.entity;

import com.soldesk.moa.board.entity.constant.BoardRole;
import com.soldesk.moa.circle.entity.Circles;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
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
@ToString(exclude = "circleId")
@Table
@Entity
public class Board {

    @Id
    private Long boardId;

    @Enumerated(EnumType.STRING)
    private BoardRole boardRole; // GLOBAL,CIRCLE

    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "circle_id", nullable = false)
    private Circles circleId;

<<<<<<< HEAD
=======
    // 수정용 setter
    public void changeTitle(String title) {
        this.title = title;
    }

    public void changeContent(String content) {
        this.content = content;
    }

>>>>>>> 003e61bc8ba3f0867e883e15fff91f95ef115c2d
}
