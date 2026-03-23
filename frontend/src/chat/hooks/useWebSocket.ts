import { useEffect, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import type { StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import type { ChatMessage } from '../types/chat';

interface ReadEvent {
  userId: number;
  lastReadAt: string;
}

interface UseWebSocketOptions {
  roomId: number;
  onMessage: (message: ChatMessage) => void;
  onReadEvent?: (event: ReadEvent) => void;
}

export function useWebSocket({ roomId, onMessage, onReadEvent }: UseWebSocketOptions) {
  const clientRef = useRef<Client | null>(null);
  const subMsgRef = useRef<StompSubscription | null>(null);
  const subReadRef = useRef<StompSubscription | null>(null);
  const roomIdRef = useRef(roomId);
  const onMessageRef = useRef(onMessage);
  const onReadEventRef = useRef(onReadEvent);

  onMessageRef.current = onMessage;
  onReadEventRef.current = onReadEvent;
  roomIdRef.current = roomId;

  const subscribeToRoom = useCallback((rid: number) => {
    const client = clientRef.current;
    if (!client?.connected || !rid) return;

    subMsgRef.current?.unsubscribe();
    subReadRef.current?.unsubscribe();

    subMsgRef.current = client.subscribe(`/topic/room/${rid}`, (frame) => {
      onMessageRef.current(JSON.parse(frame.body));
    });
    subReadRef.current = client.subscribe(`/topic/room/${rid}/read`, (frame) => {
      onReadEventRef.current?.(JSON.parse(frame.body));
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
  }, [subscribeToRoom]);

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
