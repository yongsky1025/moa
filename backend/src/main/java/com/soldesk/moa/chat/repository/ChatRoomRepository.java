package com.soldesk.moa.chat.repository;

import com.soldesk.moa.chat.domain.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {
    Optional<ChatRoom> findByDirectKey(String directKey);
    Optional<ChatRoom> findByCircleId(Long circleId);
}
