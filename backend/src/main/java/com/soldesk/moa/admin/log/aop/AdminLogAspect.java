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
import com.soldesk.moa.auth.dto.AuthUserDTO;
import com.soldesk.moa.auth.dto.LoginRequestDTO;
import com.soldesk.moa.users.repository.UsersRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Aspect
@Component
@RequiredArgsConstructor
@Log4j2
public class AdminLogAspect {
    private final AdminLogService adminLogService;
    private final HttpServletRequest request;
    private final UsersRepository usersRepository;

    @AfterReturning(pointcut = "execution(* com.soldesk.moa..*Controller.*(..))", returning = "result")
    public void logAfterSuccess(JoinPoint joinPoint, Object result) {

        if (request.getMethod().equals("GET")) {
            return;
        }

        Long userId = getLoginUserId();

        // 로그인은 SecurityContext가 비어있으므로 args에서 email로 직접 조회
        if (userId == null && request.getRequestURI().contains("/auth/login")) {
            userId = resolveUserIdFromLoginArgs(joinPoint);
        }

        if (userId == null)
            return;
        // userId = 999L; // 테스트용 유저, 운영시에는 return 활성화

        AdminActionLog actionLog = AdminActionLog.builder()
                .actorId(userId)
                .methodName(joinPoint.getSignature().getName())
                .requestUrl(request.getRequestURI())
                .actionType(resolActionType(request.getMethod(), request.getRequestURI()))
                .targetId(resolveTargetId(joinPoint))
                .targetType(resolveTargetType(request.getRequestURI()))
                .ipAddress(request.getRemoteAddr())
                .userAgent(request.getHeader("User-Agent"))
                .timestamp(LocalDateTime.now())
                .build();

        log.info("log 생성 {}", actionLog);

        adminLogService.save(actionLog);
    }

    private Long getLoginUserId() {
        // 로그인한 사용자 ID 조회 로직(security context에서)
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof AuthUserDTO userDetails) {
            return userDetails.getUserId();
        }

        return null;
    }

    private Long resolveUserIdFromLoginArgs(JoinPoint joinPoint) {
        for (Object arg : joinPoint.getArgs()) {
            if (arg instanceof LoginRequestDTO dto) {
                return usersRepository.findByEmail(dto.getEmail())
                        .map(user -> user.getUserId())
                        .orElse(null);
            }
        }
        return null;
    }

    private Long resolveTargetId(JoinPoint joinPoint) {

        Object[] args = joinPoint.getArgs();

        for (Object arg : args) {
            if (arg instanceof Long id) {
                return id;
            }
        }

        return null;
    }

    // http 메소드와 uri패턴으로 액션 타입 결정
    private ActionType resolActionType(String httpMethod, String uri) {
        // 인증
        if (uri.contains("/auth/login"))
            return ActionType.LOGIN;

        if (uri.contains("/auth/logout"))
            return ActionType.LOGOUT;

        if (uri.contains("/users/account/withdraw"))
            return ActionType.WITHDRAW;

        // 서클 가입/탈퇴
        if (uri.contains("/circles") && uri.contains("/members") && httpMethod.equals("POST"))
            return ActionType.JOIN_CIRCLE;

        if (uri.contains("/circles") && uri.contains("/members") && httpMethod.equals("DELETE"))
            return ActionType.LEAVE_CIRCLE;

        // 관리자 전용 액션
        if (uri.contains("/admin/")) {
            if (uri.contains("/approve"))
                return ActionType.APPROVE;
            if (uri.contains("/reject"))
                return ActionType.REJECT;
            if (uri.contains("/close"))
                return ActionType.CLOSE;
            if (uri.contains("/restore"))
                return ActionType.RESTORE;
            if (uri.contains("/sanctions") && uri.contains("/cancel"))
                return ActionType.CANCEL_SANCTION;
            if (uri.contains("/sanctions") && httpMethod.equals("POST"))
                return ActionType.SANCTION;
            if (uri.contains("/reports") && httpMethod.equals("PATCH"))
                return ActionType.RESOLVE_REPORT;
            if (uri.contains("/reports") && httpMethod.equals("POST"))
                return ActionType.REPORT;
        }

        // 기본 CRUD
        return switch (httpMethod) {
            case "POST" -> ActionType.CREATE;
            case "PUT", "PATCH" -> ActionType.UPDATE;
            case "DELETE" -> ActionType.DELETE;
            default -> ActionType.UNKNOWN;
        };
    }

    // uri 패턴으로 타겟 타입 결정
    private String resolveTargetType(String uri) {
        // 관리자 URI (/admin/users, /admin/circles 등)를 먼저 체크
        if (uri.contains("/admin/")) {
            if (uri.contains("/sanctions"))
                return "SANCTION";
            if (uri.contains("/reports"))
                return "REPORT";
            if (uri.contains("/users"))
                return "USER";
            if (uri.contains("/circles"))
                return "CIRCLE";
            if (uri.contains("/posts"))
                return "POST";
            if (uri.contains("/place"))
                return "PLACE";
        }

        // 일반 사용자 URI
        if (uri.contains("/users"))
            return "USER";

        if (uri.contains("/circles"))
            return "CIRCLE";

        if (uri.contains("/free"))
            return "FREE_POST";

        if (uri.contains("/notice"))
            return "NOTICE_POST";

        if (uri.contains("/circle") && uri.contains("/posts"))
            return "CIRCLE_POST";

        if (uri.contains("/replies"))
            return "REPLY";

        if (uri.contains("/place"))
            return "PLACE";

        if (uri.contains("/schedules"))
            return "SCHEDULE";

        return "UNKNOWN";
    }
}
