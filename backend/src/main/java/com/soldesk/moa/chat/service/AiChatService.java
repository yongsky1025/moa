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
                당신은 채팅 답변 도우미입니다. 주어진 대화를 분석해 자연스러운 한국어 답변을 제안해주세요.
                반드시 아래 JSON 형식만 반환하세요 (다른 텍스트 없이):
                {"quickReplies": ["짧은답변1", "짧은답변2", "짧은답변3"], "draft": "좀 더 길고 자연스러운 답변 초안"}
                - quickReplies: 각 10자 이내의 짧은 답변 3개
                - draft: 대화 흐름에 맞는 50자 이내의 답변 초안
                """;

        try {
            String text = chatClient.prompt()
                    .system(systemPrompt)
                    .user("다음 대화에 이어질 답변을 제안해줘:\n\n" + context)
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
