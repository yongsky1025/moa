package com.soldesk.moa.chat.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.soldesk.moa.chat.dto.response.ChatMessageResponse;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class AiChatService {

    private final ChatMessageService messageService;
    private final ChatClient chatClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public AiChatService(ChatMessageService messageService, ChatClient.Builder chatClientBuilder) {
        this.messageService = messageService;
        this.chatClient = chatClientBuilder.build();
    }

    /**
     * 최근 대화 기반 AI 답변 제안
     * @return { quickReplies: [...], draft: "..." }
     */
    public Map<String, Object> suggest(Long roomId, Long userId) {
        Page<ChatMessageResponse> page = messageService.getMessages(roomId, userId, 0, 20);
        List<ChatMessageResponse> messages = new ArrayList<>(page.getContent());
        Collections.reverse(messages); // 오래된 순으로

        String context = buildContext(messages);
        if (context.isBlank()) {
            return fallback();
        }
        return callAi(context);
    }

    private String buildContext(List<ChatMessageResponse> messages) {
        StringBuilder sb = new StringBuilder();
        for (ChatMessageResponse msg : messages) {
            if (!msg.isDeleted()) {
                sb.append(msg.senderNickname()).append(": ").append(msg.content()).append("\n");
            }
        }
        return sb.toString();
    }

    private Map<String, Object> callAi(String context) {
        String systemPrompt = """
                당신은 채팅 답변 도우미입니다.
                대화 내용에서 상대방이 마지막으로 한 말(질문, 요청, 감정 표현 등)의 의도를 파악하고,
                그 의도에 정확히 맞는 자연스러운 한국어 답변을 제안해주세요.
                예를 들어 "밥 먹었어?"라고 물으면 "응 먹었어", "아직이야", "방금 먹었어" 같이 그 질문에 맞는 답변을 제안해야 합니다.
                반드시 아래 JSON 형식만 반환하세요 (다른 텍스트 없이):
                {"quickReplies": ["짧은답변1", "짧은답변2", "짧은답변3"], "draft": "좀 더 자연스럽고 구체적인 답변 초안"}
                - quickReplies: 상대방 마지막 메시지 의도에 맞는 10자 이내 짧은 답변 3개
                - draft: 상대방 마지막 메시지 의도에 맞는 50자 이내 답변 초안
                """;

        try {
            String text = chatClient.prompt()
                    .system(systemPrompt)
                    .user("다음 대화에서 상대방의 마지막 메시지 의도에 맞는 답변을 제안해줘:\n\n" + context)
                    .call()
                    .content();
            return parseJson(text);
        } catch (Exception e) {
            return fallback();
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> parseJson(String text) {
        try {
            int start = text.indexOf('{');
            int end = text.lastIndexOf('}') + 1;
            if (start >= 0 && end > start) {
                return objectMapper.readValue(text.substring(start, end), Map.class);
            }
        } catch (Exception ignored) {}
        return fallback();
    }

    private Map<String, Object> fallback() {
        return Map.of(
                "quickReplies", List.of("알겠어요", "조금만요", "확인했어요"),
                "draft", ""
        );
    }
}
