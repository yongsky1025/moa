package com.soldesk.moa.notification.domain;

public enum NotificationType {
    JOIN_REQUEST,   // 리더에게: 가입 신청
    JOIN_APPROVED,  // 신청자에게: 승인
    JOIN_REJECTED,  // 신청자에게: 거절
    KICKED,         // 강퇴된 멤버에게
    CHAT_MESSAGE,     // 채팅 메시지 수신
    CIRCLE_DISBANDED  // 모임 해산
}
