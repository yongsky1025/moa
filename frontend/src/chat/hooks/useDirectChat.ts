import { useState } from 'react';
import { chatApi } from '../../api/chatApi';

export function useDirectChat() {
  const [directChatError, setDirectChatError] = useState<string | null>(null);

  const startDirectChat = async (targetUserId: number) => {
    try {
      await chatApi.getOrCreateDirectRoom(targetUserId);
    } catch (e: any) {
      const msg = e?.response?.data?.message;
      setDirectChatError(msg ?? '채팅방 생성 실패');
      return;
    }
    setDirectChatError(null);
    const popup = window.open(
      `/chat/popup#direct-${targetUserId}`,
      'moa-chat',
      'width=760,height=600,resizable=yes,scrollbars=no,status=no,toolbar=no,menubar=no'
    );
    if (popup && !popup.closed) {
      setTimeout(() => { popup.location.hash = `direct-${targetUserId}`; }, 300);
    }
  };

  const clearDirectChatError = () => setDirectChatError(null);

  return { startDirectChat, directChatError, clearDirectChatError };
}
