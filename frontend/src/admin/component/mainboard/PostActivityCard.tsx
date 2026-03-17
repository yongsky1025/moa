import { useState } from 'react';
import type {
  DailyCountDTO,
  PostActivitySummaryDTO,
} from '../../types/adminTypes';

interface Props {
  data: PostActivitySummaryDTO | null;
  loading: boolean;
}

const DAYS = ['일', '월', '화', '수', '목', '금', '토'];
const C_POST = '#D07856';
const C_REPLY = '#F2935C';

function WeeklyChart({
  posts,
  replies,
}: {
  posts: DailyCountDTO[];
  replies: DailyCountDTO[];
}) {
  const [tooltip, setTooltip] = useState<{
    idx: number;
    x: number;
    y: number;
  } | null>(null);

  const allVals = [
    ...posts.map((d) => d.count),
    ...replies.map((d) => d.count),
  ];
  const maxVal = Math.max(...allVals, 1);

  const W = 280,
    H = 100;
  const PAD = { top: 10, right: 6, bottom: 22, left: 28 };
  const CW = W - PAD.left - PAD.right;
  const CH = H - PAD.top - PAD.bottom;

  const groupW = CW / 7;
  // const barW = Math.floor(groupW * 0.28);
  // const gap = Math.floor(groupW * 0.04);
  const yPos = (v: number) => CH - (v / maxVal) * CH;
  const yTicks = [0, Math.round(maxVal / 2), maxVal];

  return (
    <div className="relative">
      <svg
        className="chart-svg w-full"
        viewBox={`0 0 ${W} ${H}`}
        style={{ overflow: 'visible' }}
      >
        {yTicks.map((v, i) => {
          const y = PAD.top + yPos(v);
          return (
            <g key={i}>
              <line
                x1={PAD.left}
                y1={y}
                x2={PAD.left + CW}
                y2={y}
                stroke={v === 0 ? '#F2E8E0' : '#FDF0E8'}
                strokeWidth="1"
              />
              <text
                x={PAD.left - 4}
                y={y}
                textAnchor="end"
                dominantBaseline="central"
                fontSize="9"
                fill="#262626"
              >
                {v}
              </text>
            </g>
          );
        })}

        {posts.map((p, i) => {
          const gx = PAD.left + i * groupW + groupW / 2;
          const date = new Date(p.date);
          return (
            <text
              key={`d-${i}`}
              x={gx}
              y={H - 4}
              textAnchor="middle"
              fontSize="9"
              fill="#262626"
            >
              {DAYS[date.getDay()]}
            </text>
          );
        })}
        {/* 게시글 선 */}
        <polyline
          fill="none"
          stroke={C_POST}
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          opacity="0.85"
          points={posts
            .map((p, i) => {
              const gx = PAD.left + i * groupW + groupW / 2;
              return `${gx},${PAD.top + yPos(p.count)}`;
            })
            .join(' ')}
        />

        {/* 댓글 선 */}
        <polyline
          fill="none"
          stroke={C_REPLY}
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          opacity="0.8"
          points={replies
            .map((r, i) => {
              const gx = PAD.left + i * groupW + groupW / 2;
              return `${gx},${PAD.top + yPos(r.count)}`;
            })
            .join(' ')}
        />

        {/* hover 점 */}
        {posts.map((p, i) => {
          const gx = PAD.left + i * groupW + groupW / 2;
          const r = replies[i];
          return (
            <g
              key={`dot-${i}`}
              className="cursor-pointer"
              onMouseEnter={() =>
                setTooltip({
                  idx: i,
                  x: gx,
                  y: PAD.top + yPos(Math.max(p.count, r?.count ?? 0)) - 4,
                })
              }
              onMouseLeave={() => setTooltip(null)}
            >
              <circle
                cx={gx}
                cy={PAD.top + yPos(p.count)}
                r="3"
                fill={C_POST}
              />
              {r && (
                <circle
                  cx={gx}
                  cy={PAD.top + yPos(r.count)}
                  r="3"
                  fill={C_REPLY}
                />
              )}
            </g>
          );
        })}
      </svg>

      {tooltip !== null && posts[tooltip.idx] && (
        <div
          className="pointer-events-none absolute z-10 rounded-lg bg-gray-800 px-2.5 py-1.5 text-xs leading-relaxed whitespace-nowrap text-white"
          style={{
            left: `${(tooltip.x / W) * 100}%`,
            top: `${(tooltip.y / H) * 100}%`,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <p className="mb-0.5 font-bold">{posts[tooltip.idx].date}</p>
          <p>
            게시글{' '}
            <strong style={{ color: C_POST }}>
              {posts[tooltip.idx].count}
            </strong>
          </p>
          <p>
            댓글{' '}
            <strong style={{ color: C_REPLY }}>
              {replies[tooltip.idx]?.count ?? 0}
            </strong>
          </p>
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
            <div className="skeleton h-12 w-20" />
            <div className="skeleton h-12 w-20" />
          </div>
          <div className="skeleton h-24 w-full" />
        </div>
      ) : (
        <>
          {/* 오늘 요약 */}
          <div className="mb-4 flex gap-0 border-b border-gray-100 pb-4">
            {[
              {
                label: '오늘 게시글',
                value: data.todayPostCount,
                color: C_POST,
              },
              {
                label: '오늘 댓글',
                value: data.todayReplyCount,
                color: C_REPLY,
              },
            ].map((s, i) => (
              <div
                key={s.label}
                className={`flex-1 ${i === 0 ? 'border-r border-gray-100 pr-4' : 'pl-4'}`}
              >
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl leading-none font-black tracking-tight text-[#262626]">
                    {s.value.toLocaleString('ko-KR')}
                  </span>
                  <span className="text-xs text-[#9B7B6A]">건</span>
                </div>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ background: s.color }}
                  />
                  <span className="text-[11px] text-[#9B7B6A]">{s.label}</span>
                </div>
              </div>
            ))}
          </div>

          {/* 주간 차트 헤더 */}
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6B4F3A]">
              주간 활동
            </span>
            <div className="flex gap-3">
              {[
                { color: C_POST, label: '게시글' },
                { color: C_REPLY, label: '댓글' },
              ].map((l) => (
                <div key={l.label} className="flex items-center gap-1">
                  <div
                    className="h-2 w-2 rounded-sm"
                    style={{ background: l.color }}
                  />
                  <span className="text-[10px] text-[#9B7B6A]">{l.label}</span>
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
