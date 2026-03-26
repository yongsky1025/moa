import { useState } from "react";
import { ShieldAlert, X, ChevronLeft, ChevronRight } from "lucide-react";

const API_HOST = "http://localhost:8080";

interface Props {
  imagePaths?: string[] | null;
}

export default function ReportEvidenceImages({ imagePaths }: Props) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const images = imagePaths ?? [];

  const prev = () =>
    setSelectedIdx((i) => (i === null ? null : (i - 1 + images.length) % images.length));
  const next = () =>
    setSelectedIdx((i) => (i === null ? null : (i + 1) % images.length));

  return (
    <>
      <div className="mt-3 rounded-xl border border-orange-300 bg-orange-50 p-4">
        <div className="mb-3 flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-orange-500" />
          <span className="text-xs font-black tracking-tight text-orange-700">
            증거 사진
          </span>
          <span className="text-xs text-orange-400">({images.length}장)</span>
        </div>

        {images.length === 0 ? (
          <p className="text-xs text-orange-400">첨부된 증거 사진이 없습니다.</p>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {images.map((path, idx) => (
              <button
                key={path}
                type="button"
                onClick={() => setSelectedIdx(idx)}
                className="group relative aspect-square overflow-hidden rounded-lg border-2 border-orange-200 bg-white transition hover:border-orange-400"
              >
                <img
                  src={`${API_HOST}${path}`}
                  alt={`증거 ${idx + 1}`}
                  className="h-full w-full object-cover transition group-hover:opacity-90"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 라이트박스 */}
      {selectedIdx !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setSelectedIdx(null)}
        >
          <div
            className="relative flex max-h-[90vh] max-w-[90vw] flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 닫기 */}
            <button
              onClick={() => setSelectedIdx(null)}
              className="absolute -top-10 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/40"
            >
              <X className="h-4 w-4" />
            </button>

            {/* 카운터 */}
            <div className="absolute -top-10 left-0 text-xs font-bold text-white">
              {selectedIdx + 1} / {images.length}
            </div>

            <img
              src={`${API_HOST}${images[selectedIdx]}`}
              alt={`증거 ${selectedIdx + 1}`}
              className="max-h-[80vh] max-w-[80vw] rounded-xl object-contain shadow-2xl"
            />

            {images.length > 1 && (
              <>
                <button
                  onClick={prev}
                  className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={next}
                  className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
