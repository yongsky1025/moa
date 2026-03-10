package com.soldesk.moa.admin.log.aop;

import java.time.LocalDateTime;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import com.soldesk.moa.admin.log.entity.AdminActionLog;
import com.soldesk.moa.admin.log.entity.constant.ActionType;
import com.soldesk.moa.admin.log.service.AdminLogService;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

@Aspect
@Component
@RequiredArgsConstructor
public class AdminLogAspect {
    private final AdminLogService adminLogService;
    private final HttpServletRequest request;

    @AfterReturning(pointcut = "execution(* com.soldesk.moa..*Controller.*(..)) && !execution(* com.soldesk.moa.admin..*Controller.*(..))", returning = "result")
    public void logAfterSuccess(JoinPoint joinPoint, Object result) {
        Long adminId = getLoginAdminId(); // 로그인한 관리자 ID 조회
        if (adminId == null)
            return;

        AdminActionLog log = AdminActionLog.builder()
                .actorId(adminId)
                .methodName(joinPoint.getSignature().getName())
                .requestUrl(request.getRequestURI())
                .actionType(resolActionType(request.getMethod(), request.getRequestURI()))
                .targetType(resolveTargetType(request.getRequestURI()))
                .timestamp(LocalDateTime.now())
                .build();

        adminLogService.save(log);
    }

    private Long getLoginAdminId() {
        // 로그인한 관리자 ID 조회 로직(security context에서)
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof CustomUserDetails userDetails) {
            return userDetails.getUserId();
        }

        return null;
    }

    // http 메소드와 uri패턴으로 액션 타입 결정
    private ActionType resolActionType(String httpMethod, String uri) {
        if (uri.contains("/login"))
            return ActionType.LOGIN;
        if (uri.contains("/logout"))
            return ActionType.LOGOUT;
        if (uri.contains("/withdraw"))
            return ActionType.WITHDRAW;
        if (uri.contains("/circles/join"))
            return ActionType.JOIN_CIRCLE;
        if (uri.contains("/circles/leave"))
            return ActionType.LEAVE_CIRCLE;

        return switch (httpMethod) {
            case "POST" -> ActionType.CREATE;
            case "PUT", "PATCH" -> ActionType.UPDATE;
            case "DELETE" -> ActionType.DELETE;
            default -> ActionType.UNKNOWN;
        };

    }

    // uri 패턴으로 타겟 타입 결정
    private String resolveTargetType(String uri) {
        if (uri.contains("/users"))
            return "USER";
        if (uri.contains("/circles"))
            return "CIRCLE";
        if (uri.contains("/posts"))
            return "POST";
        if (uri.contains("/replies"))
            return "REPLY";
        return "UNKNOWN";
    }
}
