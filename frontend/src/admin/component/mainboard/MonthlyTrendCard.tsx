import { useState } from 'react';
import type { DashboardChartDTO } from '../../types/adminTypes';

interface Props {
  data: DashboardChartDTO | null;
  loading: boolean;
}

const C_SIGNUP = '#D07856';
const C_WITHDRAWN = '#F2BB9B';

const W = 580,
  H = 180;
const PAD = { top: 16, right: 12, bottom: 36, left: 44 };
const CW = W - PAD.left - PAD.right;
const CH = H - PAD.top - PAD.bottom;

interface Tooltip {
  x: number;
  y: number;
  month: string;
  signup: number;
  withdrawn: number;
}

export default function MonthlyTrendCard({ data, loading }: Props) {
  const [tooltip, setTooltip] = useState<Tooltip | null>(null);

  const signUp = data?.signUpChart ?? [];
  const withdrawn = data?.withdrawnChart ?? [];
  const allVals = [
    ...signUp.map((d) => d.count),
    ...withdrawn.map((d) => d.count),
  ];
  const maxVal = Math.max(...allVals, 1);
  const yTicks = [0, 1, 2, 3, 4].map((i) => Math.round((maxVal / 4) * i));

  const groupW = CW / 12;
  const barW = Math.floor(groupW * 0.3);
  const barGap = Math.floor(groupW * 0.04);
  const yPos = (v: number) => CH - (v / maxVal) * CH;

  const lastSignup = signUp[signUp.length - 1]?.count ?? 0;
  const lastWithdrawn = withdrawn[withdrawn.length - 1]?.count ?? 0;
  const netGrowth = lastSignup - lastWithdrawn;

  return (
    <div className="admin-card">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="admin-card-title mb-0!">사용자 증감 추이</h3>
        <div className="flex items-center gap-4">
          {[
            { color: C_SIGNUP, label: '신규 가입', dotClass: 'bg-[#D07856]' },
            { color: C_WITHDRAWN, label: '탈퇴', dotClass: 'bg-[#F2BB9B]' },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-1.5">
              <div className={`h-2.5 w-2.5 rounded-sm ${l.dotClass}`} />
              <span className="text-xs text-gray-400">{l.label}</span>
            </div>
          ))}
          <span
            className={`text-xs font-bold ${netGrowth >= 0 ? 'text-[#D07856]' : 'text-[#F24405]'}`}
          >
            이번 달 순증 {netGrowth >= 0 ? '+' : ''}
            {netGrowth.toLocaleString('ko-KR')}
          </span>
        </div>
      </div>

      {loading || !data ? (
        <div className="skeleton h-45 w-full" />
      ) : (
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
                    x={PAD.left - 6}
                    y={y}
                    textAnchor="end"
                    dominantBaseline="central"
                    fontSize="10"
                    fill="#9B7B6A"
                  >
                    {v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}
                  </text>
                </g>
              );
            })}

            {signUp.map((s, i) => {
              const w = withdrawn[i];
              const gx = PAD.left + i * groupW + groupW / 2;
              const sh_ = Math.max((s.count / maxVal) * CH, 2);
              const wh_ = w ? Math.max((w.count / maxVal) * CH, 2) : 0;
              const sx = gx - barW - barGap / 2;
              const wx = gx + barGap / 2;
              const sy = PAD.top + CH - sh_;
              const wy = PAD.top + CH - wh_;

              return (
                <g
                  key={`${s.year}-${s.month}`}
                  className="cursor-pointer"
                  onMouseEnter={() =>
                    setTooltip({
                      x: gx,
                      y: Math.min(sy, wy) - 8,
                      month: `${s.year}.${s.month}`,
                      signup: s.count,
                      withdrawn: w?.count ?? 0,
                    })
                  }
                  onMouseLeave={() => setTooltip(null)}
                >
                  <rect
                    x={sx}
                    y={sy}
                    width={barW}
                    height={sh_}
                    fill={C_SIGNUP}
                    rx="2"
                    opacity="0.85"
                  />
                  {wh_ > 0 && (
                    <rect
                      x={wx}
                      y={wy}
                      width={barW}
                      height={wh_}
                      fill={C_WITHDRAWN}
                      rx="2"
                      opacity="0.78"
                    />
                  )}
                  <text
                    x={gx}
                    y={PAD.top + CH + 16}
                    textAnchor="middle"
                    fontSize="10"
                    fill="#9B7B6A"
                  >
                    {s.month}월
                  </text>
                </g>
              );
            })}
          </svg>

          {tooltip && (
            <div
              className="pointer-events-none absolute z-10 rounded-lg bg-gray-800 px-3 py-2 text-xs leading-relaxed whitespace-nowrap text-white"
              style={{
                left: `${(tooltip.x / W) * 100}%`,
                top: `${(tooltip.y / H) * 100}%`,
                transform: 'translate(-50%, -100%)',
              }}
            >
              <p className="mb-0.5 font-bold">{tooltip.month}</p>
              <p>
                신규{' '}
                <strong style={{ color: C_SIGNUP }}>
                  {tooltip.signup.toLocaleString('ko-KR')}명
                </strong>
              </p>
              <p>
                탈퇴{' '}
                <strong style={{ color: C_WITHDRAWN }}>
                  {tooltip.withdrawn.toLocaleString('ko-KR')}명
                </strong>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
