import { useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import type { Notification } from '../../types/notification';
import { useAuthStore } from '../../store/authStore';

export function useAlarmSocket(
  userId: number | null,
  onNotification: (n: Notification) => void,
) {
  const clientRef = useRef<Client | null>(null);
  const onNotificationRef = useRef(onNotification);
  onNotificationRef.current = onNotification;

  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    if (!userId || !token) return;

    const client = new Client({
      webSocketFactory: () => new SockJS('/ws/chat'),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe(`/topic/alarm/${userId}`, (frame) => {
          const noti: Notification = JSON.parse(frame.body);
          onNotificationRef.current(noti);
        });
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
      clientRef.current = null;
    };
  }, [userId, token]);
}
