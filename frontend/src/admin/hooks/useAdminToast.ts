import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastOptions {
  type?: ToastType;
  duration?: number; // ms, 기본 1500
  navigateTo?: string; // 성공 후 이동할 경로 (선택)
}

interface Toast {
  msg: string;
  type: ToastType;
}

export function useAdminToast() {
  const navigate = useNavigate();
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = useCallback(
    (msg: string, options: ToastOptions = {}) => {
      const { type = 'success', duration = 1500, navigateTo } = options;

      setToast({ msg, type });

      setTimeout(() => {
        setToast(null);
        if (navigateTo) navigate(navigateTo);
      }, duration);
    },
    [navigate],
  );

  return { toast, showToast };
}
