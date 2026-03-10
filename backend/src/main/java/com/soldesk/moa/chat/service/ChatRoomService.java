package com.soldesk.moa.chat.service;

import com.soldesk.moa.chat.domain.ChatRoom;
import com.soldesk.moa.chat.domain.ChatRoomMember;
import com.soldesk.moa.chat.exception.ChatErrorCode;
import com.soldesk.moa.chat.exception.ChatException;
import com.soldesk.moa.chat.repository.ChatRoomMemberRepository;
import com.soldesk.moa.chat.repository.ChatRoomRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ChatRoomService {

    private final ChatRoomRepository roomRepo;
    private final ChatRoomMemberRepository memberRepo;

    public ChatRoomService(ChatRoomRepository roomRepo, ChatRoomMemberRepository memberRepo) {
        this.roomRepo = roomRepo;
        this.memberRepo = memberRepo;
    }

    /**
     * 1:1 채팅방 조회 또는 생성.
     * directKey는 두 userId를 정렬해 만들므로 순서 무관.
     */
    @Transactional
    public ChatRoom getOrCreateDirectRoom(Long myId, Long otherId) {
        if (myId.equals(otherId)) {
            throw new ChatException(ChatErrorCode.INVALID_REQUEST, "자기 자신과 1:1 채팅을 할 수 없습니다.");
        }
        String key = directKey(myId, otherId);
        return roomRepo.findByDirectKey(key).orElseGet(() -> {
            try {
                ChatRoom room = roomRepo.save(ChatRoom.direct(key));
                memberRepo.save(ChatRoomMember.join(room.getId(), myId));
                memberRepo.save(ChatRoomMember.join(room.getId(), otherId));
                return room;
            } catch (DataIntegrityViolationException e) {
                // 동시 요청으로 UNIQUE 충돌 → 재조회
                return roomRepo.findByDirectKey(key).orElseThrow(() -> e);
            }
        });
    }

    /**
     * 모임 채팅방 조회 또는 생성.
     * 모임당 1개 방이 보장됨.
     */
    @Transactional
    public ChatRoom getOrCreateGroupRoom(Long circleId, Long myId) {
        return roomRepo.findByCircleId(circleId).orElseGet(() -> {
            try {
                ChatRoom room = roomRepo.save(ChatRoom.group(circleId));
                memberRepo.save(ChatRoomMember.join(room.getId(), myId));
                return room;
            } catch (DataIntegrityViolationException e) {
                ChatRoom room = roomRepo.findByCircleId(circleId).orElseThrow(() -> e);
                // 방은 있지만 내가 멤버가 아닐 수도 있으므로 추가
                if (!memberRepo.existsByRoomIdAndUserId(room.getId(), myId)) {
                    memberRepo.save(ChatRoomMember.join(room.getId(), myId));
                }
                return room;
            }
        });
    }

    @Transactional(readOnly = true)
    public ChatRoom getRoomOrThrow(Long roomId) {
        return roomRepo.findById(roomId)
                .orElseThrow(() -> new ChatException(ChatErrorCode.ROOM_NOT_FOUND, "채팅방을 찾을 수 없습니다."));
    }

    @Transactional(readOnly = true)
    public void assertMember(Long roomId, Long userId) {
        if (!memberRepo.existsByRoomIdAndUserId(roomId, userId)) {
            throw new ChatException(ChatErrorCode.NOT_A_MEMBER, "채팅방 멤버가 아닙니다.");
        }
    }

    @Transactional(readOnly = true)
    public ChatRoomMember getMemberOrThrow(Long roomId, Long userId) {
        return memberRepo.findByRoomIdAndUserId(roomId, userId)
                .orElseThrow(() -> new ChatException(ChatErrorCode.NOT_A_MEMBER, "채팅방 멤버가 아닙니다."));
    }

    @Transactional
    public void markAsRead(Long roomId, Long userId) {
        getMemberOrThrow(roomId, userId).markAsRead();
    }

    // ─── private ──────────────────────────────────────────────

    /** 두 userId를 오름차순 정렬하여 중복 없는 키 생성 */
    private String directKey(Long a, Long b) {
        long lo = Math.min(a, b);
        long hi = Math.max(a, b);
        return "D:" + lo + ":" + hi;
    }
}
