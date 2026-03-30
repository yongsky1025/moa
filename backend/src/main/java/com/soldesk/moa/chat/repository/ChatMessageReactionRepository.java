package com.soldesk.moa.chat.repository;

import com.soldesk.moa.chat.domain.ChatMessageReaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ChatMessageReactionRepository extends JpaRepository<ChatMessageReaction, Long> {
    List<ChatMessageReaction> findByMessageId(Long messageId);
    Optional<ChatMessageReaction> findByMessageIdAndUserId(Long messageId, Long userId);
    List<ChatMessageReaction> findByMessageIdIn(List<Long> messageIds);
    void deleteByMessageId(Long messageId);
}
