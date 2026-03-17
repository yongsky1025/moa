import { useEffect, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import type { ChatMessage } from '../types/chat';

interface UseWebSocketOptions {
  roomId: number;
  onMessage: (message: ChatMessage) => void;
}

export function useWebSocket({ roomId, onMessage }: UseWebSocketOptions) {
  const clientRef = useRef<Client | null>(null);
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  const connect = useCallback(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    const client = new Client({
      webSocketFactory: () => new SockJS('/ws/chat'),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe(`/topic/room/${roomId}`, (frame) => {
          const msg: ChatMessage = JSON.parse(frame.body);
          onMessageRef.current(msg);
        });
      },
      onStompError: (frame) => {
        console.error('STOMP 에러:', frame.headers['message']);
      },
    });

    client.activate();
    clientRef.current = client;
  }, [roomId]);

  const disconnect = useCallback(() => {
    clientRef.current?.deactivate();
    clientRef.current = null;
  }, []);

  const sendMessage = useCallback(
    (content: string) => {
      if (!clientRef.current?.connected) return;
      clientRef.current.publish({
        destination: `/app/chat/${roomId}`,
        body: JSON.stringify({ content }),
      });
    },
    [roomId]
  );

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return { sendMessage };
}
