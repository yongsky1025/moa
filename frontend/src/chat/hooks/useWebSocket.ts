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

interface UseWebSocketOptions {
  roomId: number;
  userId?: number;
  onMessage: (message: ChatMessage) => void;
  onReadEvent?: (event: ReadEvent) => void;
  onNotification?: (notification: Notification) => void;
}

export function useWebSocket({ roomId, userId, onMessage, onReadEvent, onNotification }: UseWebSocketOptions) {
  const clientRef = useRef<Client | null>(null);
  const subMsgRef = useRef<StompSubscription | null>(null);
  const subReadRef = useRef<StompSubscription | null>(null);
  const subAlarmRef = useRef<StompSubscription | null>(null);
  const roomIdRef = useRef(roomId);
  const userIdRef = useRef(userId);
  const onMessageRef = useRef(onMessage);
  const onReadEventRef = useRef(onReadEvent);
  const onNotificationRef = useRef(onNotification);

  onMessageRef.current = onMessage;
  onReadEventRef.current = onReadEvent;
  onNotificationRef.current = onNotification;
  roomIdRef.current = roomId;
  userIdRef.current = userId;

  const subscribeToRoom = useCallback((rid: number) => {
    const client = clientRef.current;
    if (!client?.connected || !rid) return;

    // 새 구독 먼저 등록 후 이전 구독 해제 → 전환 중 메시지 유실 방지
    const prevMsg = subMsgRef.current;
    const prevRead = subReadRef.current;

    subMsgRef.current = client.subscribe(`/topic/room/${rid}`, (frame) => {
      onMessageRef.current(JSON.parse(frame.body));
    });
    subReadRef.current = client.subscribe(`/topic/room/${rid}/read`, (frame) => {
      onReadEventRef.current?.(JSON.parse(frame.body));
    });

    prevMsg?.unsubscribe();
    prevRead?.unsubscribe();
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
      if (localStorage.getItem(dedupeKey)) return;
      localStorage.setItem(dedupeKey, '1');
      setTimeout(() => localStorage.removeItem(dedupeKey), 10_000);
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

  const sendMessage = useCallback((content: string) => {
    if (!clientRef.current?.connected) return;
    clientRef.current.publish({
      destination: `/app/chat/${roomIdRef.current}`,
      body: JSON.stringify({ content }),
    });
  }, []);

  return { sendMessage };
}
