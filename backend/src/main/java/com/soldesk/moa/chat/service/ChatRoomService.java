
package com.soldesk.moa.chat.service;

import com.soldesk.moa.chat.domain.ChatRoom;
import com.soldesk.moa.chat.domain.ChatRoomMember;
import com.soldesk.moa.chat.dto.response.ChatRoomSummaryResponse;
import com.soldesk.moa.chat.dto.response.ReadStatusResponse;
import com.soldesk.moa.chat.exception.ChatErrorCode;
import com.soldesk.moa.chat.exception.ChatException;
import com.soldesk.moa.chat.repository.ChatMessageRepository;
import com.soldesk.moa.chat.repository.ChatRoomMemberRepository;
import com.soldesk.moa.chat.repository.ChatRoomRepository;
import com.soldesk.moa.circle.entity.constant.CircleMemberStatus;
import com.soldesk.moa.circle.repository.CircleMemberRepository;
import com.soldesk.moa.users.repository.UsersRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class ChatRoomService {

    private final ChatRoomRepository roomRepo;
    private final ChatRoomMemberRepository memberRepo;
    private final ChatMessageRepository messageRepo;
    private final UsersRepository usersRepo;
    private final CircleMemberRepository circleMemberRepo;
    private final SimpMessagingTemplate messagingTemplate;

    public ChatRoomService(ChatRoomRepository roomRepo, ChatRoomMemberRepository memberRepo,
            ChatMessageRepository messageRepo, UsersRepository usersRepo,
            CircleMemberRepository circleMemberRepo, SimpMessagingTemplate messagingTemplate) {
        this.roomRepo = roomRepo;
        this.memberRepo = memberRepo;
        this.messageRepo = messageRepo;
        this.usersRepo = usersRepo;
        this.circleMemberRepo = circleMemberRepo;
        this.messagingTemplate = messagingTemplate;
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
        if (circleMemberRepo.findSharedActiveCircles(myId, otherId, CircleMemberStatus.ACTIVE).isEmpty()) {
            throw new ChatException(ChatErrorCode.FORBIDDEN, "같은 서클에 속한 멤버와만 1:1 채팅을 할 수 있습니다.");
        }
        String key = directKey(myId, otherId);
        ChatRoom room = roomRepo.findByDirectKey(key).orElseGet(() -> {
            try {
                ChatRoom r = roomRepo.save(ChatRoom.direct(key));
                memberRepo.save(ChatRoomMember.join(r.getId(), myId));
                memberRepo.save(ChatRoomMember.join(r.getId(), otherId));
                return r;
            } catch (DataIntegrityViolationException e) {
                // 동시 요청으로 UNIQUE 충돌 → 재조회
                return roomRepo.findByDirectKey(key).orElseThrow(() -> e);
            }
        });
        // 기존 방이 있어도 두 유저가 멤버인지 확인 (탈퇴 후 재진입 등 대비)
        if (!memberRepo.existsByRoomIdAndUserId(room.getId(), myId)) {
            memberRepo.save(ChatRoomMember.join(room.getId(), myId));
        }
        if (!memberRepo.existsByRoomIdAndUserId(room.getId(), otherId)) {
            memberRepo.save(ChatRoomMember.join(room.getId(), otherId));
        }
        return room;
    }

    /**
     * 모임 채팅방 조회 또는 생성.
     * 모임당 1개 방이 보장됨.
     */
    @Transactional
    public ChatRoom getOrCreateGroupRoom(Long circleId, Long myId) {
        return roomRepo.findByCircleId(circleId).map(room -> {
            // 방이 이미 있으면 멤버로 추가 (없는 경우에만)
            if (!memberRepo.existsByRoomIdAndUserId(room.getId(), myId)) {
                memberRepo.save(ChatRoomMember.join(room.getId(), myId));
            }
            return room;
        }).orElseGet(() -> {
            try {
                ChatRoom room = roomRepo.save(ChatRoom.group(circleId));
                memberRepo.save(ChatRoomMember.join(room.getId(), myId));
                return room;
            } catch (DataIntegrityViolationException e) {
                ChatRoom room = roomRepo.findByCircleId(circleId).orElseThrow(() -> e);
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

    /** 읽음 처리 후 새 lastReadAt 반환 (컨트롤러에서 WebSocket 브로드캐스트용) */
    @Transactional
    public java.time.LocalDateTime markAsRead(Long roomId, Long userId) {
        ChatRoomMember member = getMemberOrThrow(roomId, userId);
        member.markAsRead();
        return member.getLastReadAt();
    }

    /** 방 멤버 전체의 읽음 시각 조회 (읽음 표시 배지용) */
    @Transactional(readOnly = true)
    public List<ReadStatusResponse> getReadStatus(Long roomId, Long userId) {
        assertMember(roomId, userId);
        return memberRepo.findByRoomId(roomId).stream()
                .map(m -> new ReadStatusResponse(m.getUserId(), m.getLastReadAt()))
                .toList();
    }

    /**
     * 내가 참여 중인 채팅방 목록 조회.
     * 각 방의 마지막 메시지와 읽지 않은 메시지 수를 함께 반환.
     */
    @Transactional(readOnly = true)
    public List<ChatRoomSummaryResponse> getMyRooms(Long userId) {
        return memberRepo.findByUserId(userId).stream()
                .map(member -> {
                    ChatRoom room = roomRepo.findById(member.getRoomId())
                            .orElseThrow(() -> new ChatException(ChatErrorCode.ROOM_NOT_FOUND, "채팅방을 찾을 수 없습니다."));
                    var lastMsg = messageRepo.findTopByRoomIdOrderByCreatedAtDesc(room.getId());
                    long unread = messageRepo.countByRoomIdAndCreatedAtAfter(room.getId(), member.getLastReadAt());
                    String otherNickname = null;
                    if (room.getType() == com.soldesk.moa.chat.domain.RoomType.DIRECT) {
                        otherNickname = memberRepo.findByRoomId(room.getId()).stream()
                                .filter(m -> !m.getUserId().equals(userId))
                                .findFirst()
                                .flatMap(m -> usersRepo.findById(m.getUserId()))
                                .map(u -> u.getNickname())
                                .orElse(null);
                    }
                    return new ChatRoomSummaryResponse(
                            room.getId(),
                            room.getType(),
                            room.getCircleId(),
                            room.getScheduleId(),
                            lastMsg.map(m -> m.getContent()).orElse(null),
                            lastMsg.map(m -> m.getCreatedAt()).orElse(null),
                            unread,
                            otherNickname,
                            room.getName());
                })
                .toList();
    }

    /**
     * 일정 채팅방 조회 또는 생성.
     * 일정당 1개 방이 보장됨.
     */
    @Transactional
    public ChatRoom getOrCreateScheduleRoom(Long scheduleId, String scheduleName, Long userId) {
        return roomRepo.findByScheduleId(scheduleId).map(room -> {
            if (!memberRepo.existsByRoomIdAndUserId(room.getId(), userId)) {
                memberRepo.save(ChatRoomMember.join(room.getId(), userId));
            }
            return room;
        }).orElseGet(() -> {
            try {
                ChatRoom room = roomRepo.save(ChatRoom.schedule(scheduleId, scheduleName));
                memberRepo.save(ChatRoomMember.join(room.getId(), userId));
                return room;
            } catch (DataIntegrityViolationException e) {
                ChatRoom room = roomRepo.findByScheduleId(scheduleId).orElseThrow(() -> e);
                if (!memberRepo.existsByRoomIdAndUserId(room.getId(), userId)) {
                    memberRepo.save(ChatRoomMember.join(room.getId(), userId));
                }
                return room;
            }
        });
    }

    /**
     * 모임/일정 채팅방 이름 변경 (멤버만 가능).
     */
    @Transactional
    public void updateRoomName(Long roomId, Long userId, String name) {
        assertMember(roomId, userId);
        ChatRoom room = getRoomOrThrow(roomId);
        if (room.getType() == com.soldesk.moa.chat.domain.RoomType.DIRECT) {
            throw new ChatException(ChatErrorCode.INVALID_REQUEST, "1:1 채팅방은 이름을 변경할 수 없습니다.");
        }
        room.updateName(name);
    }

    /**
     * 채팅방 나가기.
     * - 멤버 레코드 삭제
     * - 남은 멤버가 0명이면 채팅방도 삭제
     */
    @Transactional
    public void leaveRoom(Long roomId, Long userId) {
        ChatRoomMember member = getMemberOrThrow(roomId, userId);
        String nickname = usersRepo.findById(userId)
                .map(u -> u.getNickname()).orElse("알 수 없음");
        memberRepo.delete(member);

        List<ChatRoomMember> remaining = memberRepo.findByRoomId(roomId);
        if (remaining.isEmpty()) {
            roomRepo.deleteById(roomId);
        } else {
            // 남은 멤버에게만 퇴장 시스템 메시지 브로드캐스트 (DB 저장 없음 — 알림 미발생)
            messagingTemplate.convertAndSend(
                    "/topic/room/" + roomId + "/system",
                    Map.of("type", "LEAVE", "nickname", nickname, "createdAt", LocalDateTime.now().toString()));
        }
    }

    /**
     * 내가 참여 중인 모든 채팅방의 전체 안읽은 메시지 수 합산.
     * React 채팅 아이콘 배지에 사용.
     */
    @Transactional(readOnly = true)
    public long getTotalUnreadCount(Long userId) {
        return memberRepo.findByUserId(userId).stream()
                .mapToLong(member -> messageRepo.countByRoomIdAndCreatedAtAfter(
                        member.getRoomId(), member.getLastReadAt()))
                .sum();
    }

    /**
     * 모임 채팅방 나가기 (circleId 기준).
     * 모임 탈퇴/강퇴 시 Circle 서비스에서 호출.
     * 방이 없거나 멤버가 아니면 무시.
     */
    @Transactional
    public void leaveGroupRoom(Long circleId, Long userId) {
        roomRepo.findByCircleId(circleId).ifPresent(room -> {
            memberRepo.findByRoomIdAndUserId(room.getId(), userId).ifPresent(member -> {
                memberRepo.delete(member);
                if (memberRepo.findByRoomId(room.getId()).isEmpty()) {
                    roomRepo.deleteById(room.getId());
                }
            });
        });
    }

    /**
     * 모임 채팅방 전체 삭제 (모임 해산 시).
     * 메시지, 멤버, 방 순서로 삭제.
     */
    @Transactional
    public void deleteGroupRoom(Long circleId) {
        roomRepo.findByCircleId(circleId).ifPresent(room -> {
            messageRepo.deleteByRoomId(room.getId());
            memberRepo.deleteByRoomId(room.getId());
            roomRepo.delete(room);
        });
    }

    // ─── private ──────────────────────────────────────────────

    /** 두 userId를 오름차순 정렬하여 중복 없는 키 생성 */
    private String directKey(Long a, Long b) {
        long lo = Math.min(a, b);
        long hi = Math.max(a, b);
        return "D:" + lo + ":" + hi;
    }
}
