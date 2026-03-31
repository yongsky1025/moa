import { useEffect, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import type { StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import type { ChatMessage } from '../types/chat';
import type { Notification } from '../../types/notification';

interface ReadEvent {
  userId: number;
  lastReadAt: string;
}

interface SystemEvent {
  type: 'LEAVE';
  nickname: string;
  createdAt: string;
}

export interface TypingEvent {
  userId: number;
  nickname: string;
}

export interface NoticeEvent {
  noticeMessageId: number | null;
  noticeContent: string | null;
}

interface UseWebSocketOptions {
  roomId: number;
  userId?: number;
  onMessage: (message: ChatMessage) => void;
  onReadEvent?: (event: ReadEvent) => void;
  onNotification?: (notification: Notification) => void;
  onSystemEvent?: (event: SystemEvent) => void;
  onTyping?: (event: TypingEvent) => void;
  onReaction?: (msg: ChatMessage) => void;
  onNotice?: (event: NoticeEvent) => void;
}

export function useWebSocket({ roomId, userId, onMessage, onReadEvent, onNotification, onSystemEvent, onTyping, onReaction, onNotice }: UseWebSocketOptions) {
  const clientRef = useRef<Client | null>(null);
  const subMsgRef = useRef<StompSubscription | null>(null);
  const subReadRef = useRef<StompSubscription | null>(null);
  const subSystemRef = useRef<StompSubscription | null>(null);
  const subAlarmRef = useRef<StompSubscription | null>(null);
  const subTypingRef = useRef<StompSubscription | null>(null);
  const subReactionRef = useRef<StompSubscription | null>(null);
  const subNoticeRef = useRef<StompSubscription | null>(null);
  const roomIdRef = useRef(roomId);
  const userIdRef = useRef(userId);
  const onMessageRef = useRef(onMessage);
  const onReadEventRef = useRef(onReadEvent);
  const onNotificationRef = useRef(onNotification);
  const onSystemEventRef = useRef(onSystemEvent);
  const onTypingRef = useRef(onTyping);
  const onReactionRef = useRef(onReaction);
  const onNoticeRef = useRef(onNotice);

  onMessageRef.current = onMessage;
  onReadEventRef.current = onReadEvent;
  onNotificationRef.current = onNotification;
  onSystemEventRef.current = onSystemEvent;
  onTypingRef.current = onTyping;
  onReactionRef.current = onReaction;
  onNoticeRef.current = onNotice;
  roomIdRef.current = roomId;
  userIdRef.current = userId;

  const subscribeToRoom = useCallback((rid: number) => {
    const client = clientRef.current;
    if (!client?.connected || !rid) return;

    // 새 구독 먼저 등록 후 이전 구독 해제 → 전환 중 메시지 유실 방지
    const prevMsg = subMsgRef.current;
    const prevRead = subReadRef.current;
    const prevSystem = subSystemRef.current;
    const prevTyping = subTypingRef.current;

    subMsgRef.current = client.subscribe(`/topic/room/${rid}`, (frame) => {
      onMessageRef.current(JSON.parse(frame.body));
    });
    subReadRef.current = client.subscribe(`/topic/room/${rid}/read`, (frame) => {
      onReadEventRef.current?.(JSON.parse(frame.body));
    });
    subSystemRef.current = client.subscribe(`/topic/room/${rid}/system`, (frame) => {
      onSystemEventRef.current?.(JSON.parse(frame.body));
    });
    subTypingRef.current = client.subscribe(`/topic/room/${rid}/typing`, (frame) => {
      onTypingRef.current?.(JSON.parse(frame.body));
    });

    const prevReaction = subReactionRef.current;
    subReactionRef.current = client.subscribe(`/topic/room/${rid}/reaction`, (frame) => {
      onReactionRef.current?.(JSON.parse(frame.body));
    });
    prevReaction?.unsubscribe();

    const prevNotice = subNoticeRef.current;
    subNoticeRef.current = client.subscribe(`/topic/room/${rid}/notice`, (frame) => {
      onNoticeRef.current?.(JSON.parse(frame.body));
    });
    prevNotice?.unsubscribe();

    prevMsg?.unsubscribe();
    prevRead?.unsubscribe();
    prevSystem?.unsubscribe();
    prevTyping?.unsubscribe();
  }, []);

  const subscribeToAlarm = useCallback((uid: number) => {
    const client = clientRef.current;
    if (!client?.connected || !uid) return;

    subAlarmRef.current?.unsubscribe();
    subAlarmRef.current = client.subscribe(`/topic/alarm/${uid}`, (frame) => {
      const noti = JSON.parse(frame.body);
      // 팝업 여러 창 열린 경우 중복 수신 방지 (localStorage 기반 dedup)
      // id가 null인 경우(DB 저장 전 즉시 푸시) type+referenceId+시간 윈도우로 dedup
      const dedupeKey = noti.id != null
        ? `moa_alarm_${noti.id}`
        : `moa_alarm_${noti.type}_${noti.referenceId ?? ''}_${Math.floor(Date.now() / 2000)}`;
      if (sessionStorage.getItem(dedupeKey)) return;
      sessionStorage.setItem(dedupeKey, '1');
      setTimeout(() => sessionStorage.removeItem(dedupeKey), 10_000);
      onNotificationRef.current?.(noti);
    });
  }, []);

  // 연결은 마운트 시 한 번만
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    const client = new Client({
      webSocketFactory: () => new SockJS('/ws/chat'),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      beforeConnect: () => {
        // 재연결 시 항상 최신 토큰 사용 (만료 토큰 문제 방지)
        const freshToken = localStorage.getItem('accessToken');
        if (freshToken) client.connectHeaders = { Authorization: `Bearer ${freshToken}` };
      },
      onConnect: () => {
        subscribeToRoom(roomIdRef.current);
        if (userIdRef.current) subscribeToAlarm(userIdRef.current);
      },
      onStompError: (frame) => {
        console.error('STOMP 에러:', frame.headers['message']);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
      clientRef.current = null;
    };
  }, [subscribeToRoom, subscribeToAlarm]);

  // 방 바뀌면 구독만 교체
  useEffect(() => {
    if (roomId) subscribeToRoom(roomId);
  }, [roomId, subscribeToRoom]);

  const sendMessage = useCallback((content: string, replyToId?: number | null) => {
    if (!clientRef.current?.connected) return;
    clientRef.current.publish({
      destination: `/app/chat/${roomIdRef.current}`,
      body: JSON.stringify({ content, replyToId: replyToId ?? null }),
    });
  }, []);

  const sendTyping = useCallback((nickname: string) => {
    if (!clientRef.current?.connected || !roomIdRef.current) return;
    clientRef.current.publish({
      destination: `/app/chat/${roomIdRef.current}/typing`,
      body: JSON.stringify({ nickname }),
    });
  }, []);

  return { sendMessage, sendTyping };
}
