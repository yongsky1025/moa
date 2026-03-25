import { useState } from 'react';
import type { AgeCategoryRetentionStatsDTO } from '../../types/adminTypes';

interface Props {
  data: AgeCategoryRetentionStatsDTO[];
  loading: boolean;
}

function rateToStyle(rate: number): { bg: string; text: string } {
  if (rate >= 80) return { bg: '#0C4A6E', text: '#E0F2FE' };
  if (rate >= 60) return { bg: '#0369A1', text: '#F0F9FF' };
  if (rate >= 40) return { bg: '#0EA5E9', text: '#fff' };
  if (rate >= 20) return { bg: '#7DD3FC', text: '#0C4A6E' };
  if (rate > 0)   return { bg: '#E0F2FE', text: '#0369A1' };
  return { bg: '#F1F5F9', text: '#CBD5E1' };
}

const CELL_MIN_W = 44; // 카테고리가 많을 때 이 너비 이하로는 줄어들지 않고 가로 스크롤
const CELL_H = 40;
const ROW_LABEL_W = 60;

export default function AgeCategoryRetentionCard({ data, loading }: Props) {
  const [hovered, setHovered] = useState<AgeCategoryRetentionStatsDTO | null>(null);

  if (loading) {
    return (
      <div className="admin-card">
        <div className="skeleton mb-4 h-4 w-2/5" />
        <div className="skeleton h-52 w-full rounded-xl" />
      </div>
    );
  }

  const ageGroups = [...new Set(data.map((d) => d.ageGroup))].sort();
  const categories = [...new Set(data.map((d) => d.categoryName))].sort();

  const matrix: Record<string, Record<string, AgeCategoryRetentionStatsDTO | null>> = {};
  for (const ag of ageGroups) {
    matrix[ag] = {};
    for (const cat of categories) matrix[ag][cat] = null;
  }
  for (const d of data) matrix[d.ageGroup][d.categoryName] = d;

  const avg =
    data.length > 0 ? data.reduce((s, d) => s + d.rate, 0) / data.length : 0;

  const legendStops = ['#E0F2FE', '#7DD3FC', '#0EA5E9', '#0369A1', '#0C4A6E'];

  return (
    <div className="admin-card">
      {/* 헤더 */}
      <div className="mb-4 flex items-center justify-between">
        <p className="admin-card-title mb-0">연령대 × 카테고리별 모임 유지율</p>
        <div className="flex items-center gap-3">
          <div
            className="flex items-center gap-1.5 text-[11px]"
            style={{ color: '#64748B' }}
          >
            <span>낮음</span>
            {legendStops.map((c) => (
              <div
                key={c}
                className="h-3.5 w-6 rounded-sm"
                style={{ background: c }}
              />
            ))}
            <span>높음</span>
          </div>
          <span
            className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
            style={{ background: '#E0F2FE', color: '#0369A1' }}
          >
            유지율 %
          </span>
        </div>
      </div>

      {/* 히트맵 */}
      <div className="overflow-x-auto">
        <div style={{ minWidth: ROW_LABEL_W + categories.length * CELL_MIN_W + 8 }}>
          {/* 열 헤더 (카테고리) */}
          <div className="mb-1 flex" style={{ paddingLeft: ROW_LABEL_W }}>
            {categories.map((cat) => (
              <div
                key={cat}
                className="min-w-0 truncate px-0.5 text-center text-[10px]"
                style={{ flex: 1, minWidth: CELL_MIN_W, color: '#64748B' }}
                title={cat}
              >
                {cat}
              </div>
            ))}
          </div>

          {/* 행 (연령대) */}
          {ageGroups.map((ag) => (
            <div key={ag} className="mb-1.5 flex items-center gap-1">
              {/* 행 라벨 */}
              <div
                className="shrink-0 pr-2 text-right text-[11px] font-bold"
                style={{ width: ROW_LABEL_W, color: '#475569' }}
              >
                {ag}
              </div>

              {/* 셀 */}
              {categories.map((cat) => {
                const cell = matrix[ag][cat];
                const rate = cell?.rate ?? 0;
                const { bg, text } = rateToStyle(rate);
                const isHovered =
                  hovered?.ageGroup === ag && hovered?.categoryName === cat;

                return (
                  <div
                    key={cat}
                    className="flex cursor-pointer items-center justify-center rounded-md font-bold transition-all duration-100"
                    style={{
                      flex: 1,
                      minWidth: CELL_MIN_W - 4,
                      height: CELL_H,
                      background: bg,
                      color: text,
                      fontSize: 11,
                      outline: isHovered ? '2px solid #0EA5E9' : undefined,
                      outlineOffset: isHovered ? '2px' : undefined,
                    }}
                    onMouseEnter={() => setHovered(cell)}
                    onMouseLeave={() => setHovered(null)}
                  >
                    {cell ? `${Number(rate).toFixed(0)}%` : '–'}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* 호버 상세 패널 */}
      <div
        className="mt-3 overflow-hidden rounded-xl transition-all duration-200"
        style={{
          border: '1px solid #BAE6FD',
          background: hovered ? '#F0F9FF' : '#F8FAFC',
          maxHeight: hovered ? 60 : 36,
        }}
      >
        {hovered ? (
          <div className="flex items-center justify-between px-4 py-2.5">
            <div className="flex items-center gap-2 text-sm font-bold">
              <span style={{ color: '#0C4A6E' }}>{hovered.ageGroup}</span>
              <span className="text-xs font-normal" style={{ color: '#94A3B8' }}>
                ×
              </span>
              <span style={{ color: '#0369A1' }}>{hovered.categoryName}</span>
            </div>
            <div className="flex items-center gap-4 text-xs" style={{ color: '#475569' }}>
              <span>
                유지율{' '}
                <strong className="text-sm" style={{ color: '#0369A1' }}>
                  {Number(hovered.rate).toFixed(1)}%
                </strong>
              </span>
              <span>
                유지{' '}
                <strong>{hovered.retainedMembers.toLocaleString('ko-KR')}명</strong>
              </span>
              <span>
                전체{' '}
                <strong>{hovered.totalMembers.toLocaleString('ko-KR')}명</strong>
              </span>
            </div>
          </div>
        ) : (
          <div
            className="flex h-9 items-center justify-center text-[12px]"
            style={{ color: '#94A3B8' }}
          >
            셀에 마우스를 올리면 상세 정보가 표시됩니다
          </div>
        )}
      </div>

      {/* 평균 유지율 */}
      {data.length > 0 && (
        <div
          className="mt-3 rounded-xl px-4 py-2.5 text-center text-sm"
          style={{ background: '#E0F2FE' }}
        >
          전체 평균 유지율&nbsp;
          <span className="font-black" style={{ color: '#0369A1' }}>
            {avg.toFixed(1)}%
          </span>
        </div>
      )}
    </div>
  );
}
