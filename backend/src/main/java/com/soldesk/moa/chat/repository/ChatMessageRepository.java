package com.soldesk.moa.chat.repository;

import com.soldesk.moa.chat.domain.ChatMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.Optional;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    Page<ChatMessage> findByRoomIdOrderByCreatedAtDesc(Long roomId, Pageable pageable);
    long countByRoomIdAndCreatedAtAfter(Long roomId, LocalDateTime after);
    Optional<ChatMessage> findTopByRoomIdOrderByCreatedAtDesc(Long roomId);
    void deleteByRoomId(Long roomId);
}
