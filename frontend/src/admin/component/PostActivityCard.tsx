import { useState } from 'react';
import type { PostActivitySummaryDTO, DailyCountDTO } from '../../../types/admin.types';

interface Props { data: PostActivitySummaryDTO | null; loading: boolean }

const DAYS    = ['일', '월', '화', '수', '목', '금', '토'];
const C_POST  = '#34c77b';
const C_REPLY = '#5b8dee';

function WeeklyChart({ posts, replies }: { posts: DailyCountDTO[]; replies: DailyCountDTO[] }) {
  const [tooltip, setTooltip] = useState<{ idx: number; x: number; y: number } | null>(null);

  const allVals = [...posts.map(d => d.count), ...replies.map(d => d.count)];
  const maxVal  = Math.max(...allVals, 1);

  const W = 280, H = 100;
  const PAD = { top: 10, right: 6, bottom: 22, left: 28 };
  const CW = W - PAD.left - PAD.right;
  const CH = H - PAD.top - PAD.bottom;

  const groupW = CW / 7;
  const barW   = Math.floor(groupW * 0.28);
  const gap    = Math.floor(groupW * 0.04);
  const yPos   = (v: number) => CH - (v / maxVal) * CH;
  const yTicks = [0, Math.round(maxVal / 2), maxVal];

  return (
    <div className="relative">
      <svg className="chart-svg w-full" viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
        {yTicks.map((v, i) => {
          const y = PAD.top + yPos(v);
          return (
            <g key={i}>
              <line x1={PAD.left} y1={y} x2={PAD.left + CW} y2={y}
                stroke={v === 0 ? '#e5e7eb' : '#f9fafb'} strokeWidth="1" />
              <text x={PAD.left - 4} y={y} textAnchor="end" dominantBaseline="central"
                fontSize="9" fill="#d1d5db">{v}</text>
            </g>
          );
        })}

        {posts.map((p, i) => {
          const r = replies[i];
          const gx = PAD.left + i * groupW + groupW / 2;
          const ph = Math.max((p.count / maxVal) * CH, 1);
          const rh = r ? Math.max((r.count / maxVal) * CH, 1) : 0;
          const date = new Date(p.date);

          return (
            <g key={p.date} className="cursor-pointer"
              onMouseEnter={() => setTooltip({ idx: i, x: gx, y: PAD.top + yPos(Math.max(p.count, r?.count ?? 0)) - 4 })}
              onMouseLeave={() => setTooltip(null)}
            >
              <rect x={gx - barW - gap / 2} y={PAD.top + yPos(p.count)} width={barW} height={ph}
                fill={C_POST} rx="2" opacity="0.85" />
              {rh > 0 && (
                <rect x={gx + gap / 2} y={PAD.top + yPos(r!.count)} width={barW} height={rh}
                  fill={C_REPLY} rx="2" opacity="0.8" />
              )}
              <text x={gx} y={H - 4} textAnchor="middle" fontSize="9" fill="#d1d5db">
                {DAYS[date.getDay()]}
              </text>
            </g>
          );
        })}
      </svg>

      {tooltip !== null && posts[tooltip.idx] && (
        <div className="absolute z-10 pointer-events-none whitespace-nowrap
                        bg-gray-800 text-white text-xs rounded-lg px-2.5 py-1.5 leading-relaxed"
          style={{
            left: `${(tooltip.x / W) * 100}%`,
            top:  `${(tooltip.y / H) * 100}%`,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <p className="font-bold mb-0.5">{posts[tooltip.idx].date}</p>
          <p>게시글 <strong style={{ color: C_POST }}>{posts[tooltip.idx].count}</strong></p>
          <p>댓글 <strong style={{ color: C_REPLY }}>{replies[tooltip.idx]?.count ?? 0}</strong></p>
        </div>
      )}
    </div>
  );
}

export default function PostActivityCard({ data, loading }: Props) {
  return (
    <div className="admin-card">
      <h3 className="admin-card-title">게시글 활동</h3>

      {loading || !data ? (
        <div className="flex flex-col gap-3">
          <div className="flex gap-4">
            <div className="skeleton w-20 h-12" />
            <div className="skeleton w-20 h-12" />
          </div>
          <div className="skeleton h-24 w-full" />
        </div>
      ) : (
        <>
          {/* 오늘 요약 */}
          <div className="flex gap-0 mb-4 pb-4 border-b border-gray-100">
            {[
              { label: '오늘 게시글', value: data.todayPostCount, color: C_POST },
              { label: '오늘 댓글',   value: data.todayReplyCount, color: C_REPLY },
            ].map((s, i) => (
              <div key={s.label}
                className={`flex-1 ${i === 0 ? 'pr-4 border-r border-gray-100' : 'pl-4'}`}
              >
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-gray-900 tracking-tight leading-none">
                    {s.value.toLocaleString('ko-KR')}
                  </span>
                  <span className="text-xs text-gray-300">건</span>
                </div>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                  <span className="text-[11px] text-gray-400">{s.label}</span>
                </div>
              </div>
            ))}
          </div>

          {/* 주간 차트 헤더 */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500">주간 활동</span>
            <div className="flex gap-3">
              {[{ color: C_POST, label: '게시글' }, { color: C_REPLY, label: '댓글' }].map(l => (
                <div key={l.label} className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-sm" style={{ background: l.color }} />
                  <span className="text-[10px] text-gray-400">{l.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* weeklyReplies — 백엔드 오타 수정 반영 */}
          <WeeklyChart posts={data.weeklyPosts} replies={data.weeklyReplies} />
        </>
      )}
    </div>
  );
}
