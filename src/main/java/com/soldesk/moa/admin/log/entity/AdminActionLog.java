package com.soldesk.moa.admin.log.entity;

import java.time.LocalDateTime;

import com.soldesk.moa.admin.log.entity.constant.ActionType;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
@Table(name = "admin_action_log")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class AdminActionLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long actorId; // 로그 발생 유저 ID

    private String targetType; // 대상(테이블) 유형 (예: "USER", "CIRCLE", "POST")

    private Long targetId; // 대상 PK

    @Enumerated(EnumType.STRING)
    private ActionType actionType; // 액션 유형

    private String methodName; // 실행된 메서드 이름

    private String requestUrl; // 요청 URL

    private LocalDateTime timestamp; // 액션 발생 시간
}
