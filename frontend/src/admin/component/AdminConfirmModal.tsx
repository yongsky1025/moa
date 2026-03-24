interface Props {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  confirmColor?: 'green' | 'red';
  onConfirm: () => void;
  onCancel: () => void;
}

export default function AdminConfirmModal({
  open, title, message, confirmLabel = '확인', confirmColor = 'green', onConfirm, onCancel,
}: Props) {
  if (!open) return null;

  const btnCls = confirmColor === 'green'
    ? 'bg-moa-primary hover:bg-moa-hover text-white'
    : 'bg-red-500 hover:bg-red-600 text-white';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onCancel}>
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-moa-text text-lg font-bold">{title}</h3>
        <p className="text-moa-subtle mt-3 text-sm leading-relaxed">{message}</p>
        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="border-moa-border text-moa-subtle hover:bg-moa-light cursor-pointer rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className={`cursor-pointer rounded-lg px-4 py-2 text-sm font-bold transition-colors ${btnCls}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
