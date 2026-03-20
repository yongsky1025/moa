import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchCircleCategories, createCircleCategory } from '../api/adminCircleApi';
import AdminConfirmModal from '../component/AdminConfirmModal';
import AdminResultModal from '../component/AdminResultModal';

export default function AdminCircleCategoryPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<string[]>([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [resultMsg, setResultMsg] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchCircleCategories().then(setCategories).catch(() => {});
  }, []);

  // 추가 버튼 → 유효성 검사 후 확인 모달 열기
  const requestAdd = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('카테고리 이름을 입력해주세요.');
      return;
    }
    if (categories.includes(trimmed)) {
      setError('이미 존재하는 카테고리입니다.');
      return;
    }
    setError('');
    setConfirmOpen(true);
  };

  // 확인 모달에서 확인 → 실제 API 호출
  const handleConfirmAdd = async () => {
    setConfirmOpen(false);
    const trimmed = name.trim();

    setLoading(true);
    try {
      await createCircleCategory({ categoryName: trimmed });
      setCategories((prev) => [...prev, trimmed]);
      setName('');
      setResultMsg(`"${trimmed}" 카테고리가 추가되었습니다.`);
    } catch {
      setError('카테고리 추가에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-full flex-col gap-6 bg-[#FDFAF8] px-6 py-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-moa-primary flex h-10 w-10 items-center justify-center rounded-xl shadow-sm">
            <span className="text-lg text-white">◎</span>
          </div>
          <div>
            <h1 className="text-moa-text text-2xl font-bold tracking-tight">카테고리 관리</h1>
            <p className="text-moa-subtle mt-0.5 text-sm">
              모임 카테고리를 확인하고 추가합니다.
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate('/admin/circles')}
          className="text-moa-secondary border-moa-border hover:bg-moa-light hover:border-moa-primary flex cursor-pointer items-center gap-1 rounded-xl border bg-white px-4 py-2 text-sm font-medium shadow-sm transition-all"
        >
          ‹ 모임 목록
        </button>
      </div>

      {/* 카드 */}
      <div className="border-moa-border mx-auto w-full max-w-lg rounded-2xl border bg-white shadow-sm">
        {/* 등록된 카테고리 */}
        <div className="border-moa-border border-b px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="bg-moa-primary h-4 w-1 rounded-full" />
            <span className="text-moa-secondary text-xs font-bold uppercase tracking-widest">
              등록된 카테고리 ({categories.length})
            </span>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {categories.length === 0 ? (
              <p className="text-moa-subtle text-sm">등록된 카테고리가 없습니다.</p>
            ) : (
              categories.map((c) => (
                <span
                  key={c}
                  className="bg-moa-light text-moa-secondary inline-flex items-center rounded-full px-3 py-1 text-sm font-medium"
                >
                  {c}
                </span>
              ))
            )}
          </div>
        </div>

        {/* 추가 입력 */}
        <div className="px-6 py-5">
          <div className="flex items-center gap-2 mb-1">
            <div className="bg-moa-primary h-4 w-1 rounded-full" />
            <span className="text-moa-secondary text-xs font-bold uppercase tracking-widest">
              새 카테고리 추가
            </span>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <input
              ref={inputRef}
              value={name}
              onChange={(e) => { setName(e.target.value); setError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && !loading && requestAdd()}
              placeholder="카테고리 이름 입력"
              maxLength={20}
              className="border-moa-border text-moa-text placeholder:text-moa-subtle focus:border-moa-primary h-10 flex-1 rounded-lg border px-3 text-sm outline-none transition-colors"
            />
            <button
              onClick={requestAdd}
              disabled={loading}
              className="bg-moa-primary hover:bg-moa-hover h-10 cursor-pointer rounded-lg px-5 text-sm font-bold text-white shadow-sm transition-colors disabled:opacity-50"
            >
              {loading ? '추가 중...' : '추가'}
            </button>
          </div>

          {error && <p className="mt-2 text-xs font-medium text-red-500">{error}</p>}
        </div>
      </div>

      <AdminConfirmModal
        open={confirmOpen}
        title="카테고리 추가"
        message={`"${name.trim()}" 카테고리를 추가하시겠습니까?`}
        confirmLabel="추가"
        confirmColor="green"
        onConfirm={handleConfirmAdd}
        onCancel={() => setConfirmOpen(false)}
      />

      <AdminResultModal
        open={!!resultMsg}
        message={resultMsg}
        onClose={() => { setResultMsg(''); inputRef.current?.focus(); }}
      />
    </div>
  );
}
