interface Props {
  open: boolean;
  message: string;
  onClose: () => void;
}

export default function AdminResultModal({ open, message, onClose }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center gap-4 py-2">
          <div className="bg-moa-light flex h-14 w-14 items-center justify-center rounded-full">
            <svg className="text-moa-primary h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-moa-text text-center text-sm font-medium leading-relaxed">{message}</p>
        </div>
        <div className="mt-4 flex justify-center">
          <button
            onClick={onClose}
            className="bg-moa-primary hover:bg-moa-hover cursor-pointer rounded-lg px-6 py-2 text-sm font-bold text-white transition-colors"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
