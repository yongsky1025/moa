import type { UserCountDTO } from '../types/adminTypes';

interface Props {
  data: UserCountDTO | null;
  loading: boolean;
}

const COLORS = {
  male: { stroke: '#5b8dee', bg: 'bg-blue-400', dot: 'bg-blue-400' },
  female: { stroke: '#e88a9a', bg: 'bg-pink-400', dot: 'bg-pink-400' },
  unspecified: { stroke: '#d1d5db', bg: 'bg-gray-300', dot: 'bg-gray-300' },
};

interface Seg {
  key: keyof typeof COLORS;
  label: string;
  count: number;
  ratio: number;
}

function buildSegments(d: UserCountDTO): Seg[] {
  const total = d.countTotalUser;
  const unspec = Math.max(total - d.maleUser - d.femaleUser, 0);
  return [
    {
      key: 'male' as const,
      label: '남성',
      count: d.maleUser,
      ratio: d.maleRatio,
    },
    {
      key: 'female' as const,
      label: '여성',
      count: d.femaleUser,
      ratio: d.femaleRatio,
    },
    {
      key: 'unspecified' as const,
      label: '미지정',
      count: unspec,
      ratio: total > 0 ? Math.round((unspec / total) * 1000) / 10 : 0,
    },
  ].filter((s) => s.count > 0);
}

function DonutSVG({ segs, total }: { segs: Seg[]; total: number }) {
  const cx = 58,
    cy = 58,
    r = 42,
    sw = 14;
  const circ = 2 * Math.PI * r;
  let off = 0;
  const arcs = segs.map((s) => {
    const d = (s.count / total) * circ;
    const a = { ...s, d, off };
    off += d;
    return a;
  });

  return (
    <svg className="chart-svg" width="116" height="116" viewBox="0 0 116 116">
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="#f2f2f2"
        strokeWidth={sw}
      />
      {arcs.map((a) => (
        <circle
          key={a.label}
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={COLORS[a.key].stroke}
          strokeWidth={sw}
          strokeDasharray={`${a.d} ${circ}`}
          strokeDashoffset={-a.off}
          transform={`rotate(-90 ${cx} ${cy})`}
        />
      ))}
      <text x={cx} y={cy - 7} textAnchor="middle" fontSize="11" fill="#9ca3af">
        전체
      </text>
      <text
        x={cx}
        y={cy + 10}
        textAnchor="middle"
        fontSize="15"
        fontWeight="700"
        fill="#111827"
      >
        {total.toLocaleString('ko-KR')}
      </text>
      <text x={cx} y={cy + 24} textAnchor="middle" fontSize="10" fill="#d1d5db">
        명
      </text>
    </svg>
  );
}

export default function GenderDonutCard({ data, loading }: Props) {
  return (
    <div className="admin-card">
      <h3 className="admin-card-title">성별 분포</h3>

      {loading || !data ? (
        <div className="flex flex-col items-center gap-4">
          <div className="skeleton h-29 w-29 rounded-full" />
          <div className="flex gap-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="skeleton h-12 w-16" />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <DonutSVG segs={buildSegments(data)} total={data.countTotalUser} />
          <div className="flex flex-wrap justify-center gap-3">
            {buildSegments(data).map((s) => (
              <div key={s.label} className="min-w-14.5 text-center">
                <div className="mb-1 flex items-center justify-center gap-1">
                  <div
                    className={`h-2 w-2 rounded-full ${COLORS[s.key].dot}`}
                  />
                  <span className="text-xs text-gray-500">{s.label}</span>
                </div>
                <p className="text-sm font-bold text-gray-800">
                  {s.count.toLocaleString('ko-KR')}명
                </p>
                <p className="mt-0.5 text-[10px] text-gray-400">{s.ratio}%</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
