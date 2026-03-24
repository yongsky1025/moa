import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchPopularCircles } from '../../api/adminCircleApi';
import type { PopularCircleDTO } from '../../types/adminTypes';

const RANK_COLORS = [
  { badge: 'bg-amber-400 text-white', bar: 'bg-amber-400' },
  { badge: 'bg-sky-400 text-white', bar: 'bg-sky-400' },
  { badge: 'bg-rose-400 text-white', bar: 'bg-rose-400' },
  { badge: 'bg-violet-400 text-white', bar: 'bg-violet-400' },
  { badge: 'bg-teal-400 text-white', bar: 'bg-teal-400' },
];

export default function AdminPopularCircles() {
  const navigate = useNavigate();
  const [circles, setCircles] = useState<PopularCircleDTO[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setCircles(await fetchPopularCircles());
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="border-moa-border rounded-2xl border bg-white shadow-sm">
      <div className="border-moa-border flex items-center gap-2 border-b px-5 py-3.5">
        <div className="bg-moa-accent h-4 w-1 rounded-full" />
        <span className="text-moa-secondary text-sm font-bold tracking-wide">인기 모임 TOP 5</span>
        <span className="text-moa-subtle text-xs">(최근 7일 기준)</span>
      </div>

      <div className="grid grid-cols-5 gap-4 p-5">
        {loading && Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="border-moa-border animate-pulse rounded-xl border p-5">
            <div className="bg-moa-border mb-3 h-6 w-8 rounded-full" />
            <div className="bg-moa-border mb-2 h-5 w-3/4 rounded" />
            <div className="bg-moa-border h-4 w-1/2 rounded" />
          </div>
        ))}

        {!loading && circles.length === 0 && (
          <div className="col-span-5 py-8 text-center">
            <span className="text-moa-subtle text-sm">인기 모임 데이터가 없습니다.</span>
          </div>
        )}

        {!loading && circles.map((c, idx) => {
          const color = RANK_COLORS[idx] ?? RANK_COLORS[4];
          return (
            <div
              key={c.circleId}
              onClick={() => navigate(`/admin/circles/${c.circleId}`)}
              className="border-moa-border hover:border-moa-primary group cursor-pointer rounded-xl border p-5 transition-all hover:shadow-md"
            >
              {/* 순위 + 인원 */}
              <div className="mb-3 flex items-center justify-between">
                <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold ${color.badge}`}>
                  {idx + 1}
                </span>
                <span className="text-moa-subtle text-xs font-semibold">{c.currentMember}명</span>
              </div>

              {/* 모임명 */}
              <p className="text-moa-text group-hover:text-moa-primary mb-1.5 truncate text-base font-bold transition-colors">
                {c.circleName}
              </p>

              {/* 카테고리 */}
              <p className="text-moa-subtle truncate text-sm">{c.categoryName}</p>

              {/* 점수 바 */}
              <div className="mt-4">
                <div className="bg-moa-border h-2 w-full overflow-hidden rounded-full">
                  <div
                    className={`h-full rounded-full transition-all ${color.bar}`}
                    style={{ width: `${Math.min((c.score / (circles[0]?.score || 1)) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-moa-subtle mt-1.5 text-right text-xs font-semibold">{c.score.toFixed(1)}점</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
