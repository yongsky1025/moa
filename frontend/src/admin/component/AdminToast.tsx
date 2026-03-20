type ToastType = 'success' | 'error' | 'info' | 'warning';

const TOAST_STYLE: Record<ToastType, { bg: string; icon: string }> = {
  success: { bg: 'bg-emerald-600', icon: '✅' },
  error: { bg: 'bg-rose-600', icon: '❌' },
  info: { bg: 'bg-blue-500', icon: 'ℹ️' },
  warning: { bg: 'bg-amber-500', icon: '⚠️' },
};

interface ToastProps {
  msg: string;
  type: ToastType;
}

export default function AdminToast({ msg, type }: ToastProps) {
  const { bg, icon } = TOAST_STYLE[type];
  return (
    <div
      className={`animate-fade-in-up fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-2xl px-6 py-3 text-sm font-bold text-white shadow-xl ${bg}`}
    >
      {icon} {msg}
    </div>
  );
}
