package com.soldesk.moa.chat.dto.request;

/** STOMP /app/chat/{roomId} 로 전송하는 메시지 요청 */
public record SendMessageRequest(String content) {}
