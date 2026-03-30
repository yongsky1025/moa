package com.soldesk.moa.place.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Table
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {})
public class TagCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name; // 예: 공간 유형, 시설, 분위기, 용도, 인원 등등등

    private Integer sortOrder; // 표시 순서

    @Builder.Default
    private Boolean isActive = true;

    @Builder.Default
    private Boolean scheduleEnabled = false; // true면 일정 생성 시에도 사용 가능
}
