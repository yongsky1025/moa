type ToastType = 'success' | 'error' | 'info' | 'warning';

const TOAST_STYLE: Record<ToastType, { bg: string; icon: string }> = {
  success: { bg: 'bg-emerald-600', icon: '✅' },
  error: { bg: 'bg-rose-600', icon: '❌' },
  info: { bg: 'bg-blue-500', icon: 'ℹ️' },
  warning: { bg: 'bg-amber-500', icon: '⚠️' },
};

interface ToastProps {
  toast: { msg: string; type: ToastType } | null;
}

export default function AdminToast({ toast }: ToastProps) {
  if (!toast) return null;
  const { bg, icon } = TOAST_STYLE[toast.type];
  return (
    <div
      className={`animate-fade-in-up fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-2xl px-6 py-3 text-sm font-bold text-white shadow-xl ${bg}`}
    >
      {icon} {toast.msg}
    </div>
  );
}
