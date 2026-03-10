package com.soldesk.moa.chat.repository;

import com.soldesk.moa.chat.domain.ChatRoomMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ChatRoomMemberRepository extends JpaRepository<ChatRoomMember, Long> {
    boolean existsByRoomIdAndUserId(Long roomId, Long userId);
    Optional<ChatRoomMember> findByRoomIdAndUserId(Long roomId, Long userId);
}
