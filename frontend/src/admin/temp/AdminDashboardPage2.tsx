/**
 * MOA Admin Dashboard Page
 * - 기존 Navbar / Footer 유지
 * - 사이드바 포함 2컬럼 레이아웃
 * - useAdminMain + usePostActivity 훅 연결
 */

import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../../common/layout/Navbar';
import Footer from '../../common/layout/Footer';
import type {
  CircleDataDTO,
  DailyCountDTO,
  MonthlyCountDTO,
} from '../types/adminTypes';
import { useAdminMain } from '../hooks/UseAdminMain';
import { usePostActivity } from '../hooks/UsePostActivity';

// ─────────────────────────────────────────
// Props
// ─────────────────────────────────────────
interface AdminDashboardPageProps {
  isLoggedIn?: boolean;
  isAdmin?: boolean;
  userName?: string;
}

// ─────────────────────────────────────────
// 사이드바 메뉴 구성
// ─────────────────────────────────────────
interface MenuItem {
  key: string;
  label: string;
  icon: string;
  path?: string;
  children?: { key: string; label: string; path: string }[];
}

const MENU_ITEMS: MenuItem[] = [
  { key: 'dashboard', label: '대시보드', icon: '⊞', path: '/admin' },
  { key: 'users', label: '유저 관리', icon: '👥', path: '/admin/users' },
  {
    key: 'circles',
    label: '모임 관리',
    icon: '◎',
    children: [
      {
        key: 'circles-pending',
        label: '생성 승인 대기',
        path: '/admin/circles/pending',
      },
      { key: 'circles-all', label: '전체 모임 관리', path: '/admin/circles' },
    ],
  },
  { key: 'posts', label: '게시글 관리', icon: '📋', path: '/admin/posts' },
  {
    key: 'reports',
    label: '신고 / 제재 관리',
    icon: '🚩',
    children: [
      { key: 'reports-list', label: '신고 확인', path: '/admin/reports' },
      { key: 'sanctions-list', label: '제재 확인', path: '/admin/sanctions' },
    ],
  },
  { key: 'stats', label: '통계 리포트', icon: '📊', path: '/admin/stats' },
  {
    key: 'logs',
    label: '유저 활동 로그',
    icon: '🗒',
    children: [
      { key: 'logs-all', label: '전체 로그', path: '/admin/logs' },
      { key: 'logs-user', label: '특정 유저 로그', path: '/admin/logs/user' },
    ],
  },
];

// ─────────────────────────────────────────
// 유틸
// ─────────────────────────────────────────
function fmtNum(n: number) {
  return n.toLocaleString('ko-KR');
}
function fmtMonth(dto: MonthlyCountDTO) {
  return `${dto.month}월`;
}

// ─────────────────────────────────────────
// Skeleton
// ─────────────────────────────────────────
function Skeleton({
  width = '100%',
  height = 16,
  radius = 6,
}: {
  width?: string | number;
  height?: number;
  radius?: number;
}) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: radius,
        background:
          'linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.4s infinite',
      }}
    />
  );
}

// ─────────────────────────────────────────
// 도넛 차트 (SVG)
// ─────────────────────────────────────────
function DonutChart({ male, female }: { male: number; female: number }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const maleDash = (male / 100) * circ;
  const femaleDash = (female / 100) * circ;

  return (
    <svg width="96" height="96" viewBox="0 0 96 96">
      {/* 배경 링 */}
      <circle
        cx="48"
        cy="48"
        r={r}
        fill="none"
        stroke="#f0f0f0"
        strokeWidth="12"
      />
      {/* 여성 */}
      <circle
        cx="48"
        cy="48"
        r={r}
        fill="none"
        stroke="#e88a9a"
        strokeWidth="12"
        strokeDasharray={`${femaleDash} ${circ}`}
        strokeDashoffset={-maleDash}
        strokeLinecap="butt"
        transform="rotate(-90 48 48)"
      />
      {/* 남성 */}
      <circle
        cx="48"
        cy="48"
        r={r}
        fill="none"
        stroke="#5b8dee"
        strokeWidth="12"
        strokeDasharray={`${maleDash} ${circ}`}
        strokeDashoffset={0}
        strokeLinecap="butt"
        transform="rotate(-90 48 48)"
      />
      <text
        x="48"
        y="45"
        textAnchor="middle"
        fontSize="11"
        fill="#888"
        fontFamily="inherit"
      >
        성비
      </text>
      <text
        x="48"
        y="60"
        textAnchor="middle"
        fontSize="12"
        fontWeight="600"
        fill="#333"
        fontFamily="inherit"
      >
        {male}:{female}
      </text>
    </svg>
  );
}

// ─────────────────────────────────────────
// 가로 바 차트 (카테고리)
// ─────────────────────────────────────────
function CategoryBars({ data }: { data: CircleDataDTO[] }) {
  const max = Math.max(...data.map((d) => d.countPerCategory), 1);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {data.map((d) => (
        <div
          key={d.categoryName}
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <span
            style={{
              fontSize: 12,
              color: '#888',
              minWidth: 60,
              textAlign: 'right',
            }}
          >
            {d.categoryName}
          </span>
          <div
            style={{
              flex: 1,
              height: 8,
              background: '#f2f2f2',
              borderRadius: 4,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${(d.countPerCategory / max) * 100}%`,
                height: '100%',
                background: '#5b8dee',
                borderRadius: 4,
                transition: 'width 0.6s ease',
              }}
            />
          </div>
          <span
            style={{
              fontSize: 12,
              color: '#555',
              minWidth: 22,
              textAlign: 'right',
            }}
          >
            {d.countPerCategory}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────
// 미니 바 차트 (주간 게시글)
// ─────────────────────────────────────────
function MiniBarChart({
  data,
  color = '#34c77b',
}: {
  data: DailyCountDTO[];
  color?: string;
}) {
  const max = Math.max(...data.map((d) => d.count), 1);
  const days = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <div
      style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 52 }}
    >
      {data.map((d) => {
        const h = Math.max(Math.round((d.count / max) * 44), 4);
        const date = new Date(d.date);
        const dayLabel = days[date.getDay()];
        return (
          <div
            key={d.date}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
            }}
          >
            <div
              style={{
                width: '100%',
                height: h,
                background: color,
                borderRadius: '3px 3px 0 0',
                opacity: 0.85,
              }}
            />
            <span style={{ fontSize: 9, color: '#aaa' }}>{dayLabel}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────
// 월별 추이 차트
// ─────────────────────────────────────────
function MonthlyChart({
  signUp,
  withdrawn,
}: {
  signUp: MonthlyCountDTO[];
  withdrawn: MonthlyCountDTO[];
}) {
  const allCounts = [
    ...signUp.map((d) => d.count),
    ...withdrawn.map((d) => d.count),
  ];
  const max = Math.max(...allCounts, 1);

  return (
    <div>
      <div
        style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 80 }}
      >
        {signUp.map((s, i) => {
          const w = withdrawn[i];
          const sh = Math.max(Math.round((s.count / max) * 72), 2);
          const wh = w ? Math.max(Math.round((w.count / max) * 72), 2) : 0;
          return (
            <div
              key={`${s.year}-${s.month}`}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'flex-end',
                gap: 1,
                height: 72,
              }}
              title={`${fmtMonth(s)}: 가입 ${s.count}명, 탈퇴 ${w?.count ?? 0}명`}
            >
              <div
                style={{
                  flex: 1,
                  height: sh,
                  background: '#5b8dee',
                  borderRadius: '2px 2px 0 0',
                  opacity: 0.8,
                }}
              />
              <div
                style={{
                  flex: 1,
                  height: wh,
                  background: '#ff7b72',
                  borderRadius: '2px 2px 0 0',
                  opacity: 0.75,
                }}
              />
            </div>
          );
        })}
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: 5,
        }}
      >
        {signUp.map((s) => (
          <span
            key={`${s.year}-${s.month}`}
            style={{ flex: 1, fontSize: 9, color: '#bbb', textAlign: 'center' }}
          >
            {s.month}월
          </span>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
        {[
          ['#5b8dee', '가입'],
          ['#ff7b72', '탈퇴'],
        ].map(([color, label]) => (
          <div
            key={label}
            style={{ display: 'flex', alignItems: 'center', gap: 4 }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: color,
              }}
            />
            <span style={{ fontSize: 11, color: '#888' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// 빠른 작업 버튼
// ─────────────────────────────────────────
const QUICK_ACTIONS = [
  { icon: '👥', label: '유저 관리', path: '/admin/users' },
  { icon: '⏳', label: '승인 대기', path: '/admin/circles/pending' },
  { icon: '📋', label: '게시글 관리', path: '/admin/posts' },
  { icon: '🚩', label: '신고 확인', path: '/admin/reports' },
  { icon: '⛔', label: '제재 확인', path: '/admin/sanctions' },
  { icon: '◎', label: '전체 모임', path: '/admin/circles' },
  { icon: '📊', label: '통계 리포트', path: '/admin/stats' },
  { icon: '🗒', label: '활동 로그', path: '/admin/logs' },
];

// ─────────────────────────────────────────
// 메인 컴포넌트
// ─────────────────────────────────────────
export default function AdminDashboardPage2({
  isLoggedIn = true,
  isAdmin = true,
  userName = '',
}: AdminDashboardPageProps) {
  const navigate = useNavigate();
  const location = useLocation();

  // 사이드바 서브메뉴 열림 상태
  const [openMenus, setOpenMenus] = useState<Set<string>>(
    new Set(['circles', 'reports', 'logs']),
  );

  // 데이터 훅
  const {
    data: mainData,
    loading: mainLoading,
    error: mainError,
    refetch: refetchMain,
  } = useAdminMain();
  const { data: postData, loading: postLoading } = usePostActivity();

  const toggleMenu = (key: string) => {
    setOpenMenus((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const isActive = (path?: string) => path && location.pathname === path;
  const isParentActive = (item: MenuItem) =>
    item.children?.some((c) => location.pathname === c.path);

  const loading = mainLoading || postLoading;

  // ── 파생 데이터 ──────────────────────
  const userCount = mainData?.userCountDTO;
  const userStatus = mainData?.userStatusDTO;
  const circleSummary = mainData?.circleSummaryDTO;
  const chartData = mainData?.dashboardChartDTO;

  const joinRate = userCount
    ? Math.round((userCount.countJoinUser / userCount.countTotalUser) * 100)
    : 0;

  // ── 스타일 상수 ────────────────────────
  const card: React.CSSProperties = {
    backgroundColor: '#fff',
    borderRadius: 14,
    border: '1px solid #ebebeb',
    padding: '20px 22px',
  };

  const cardTitle: React.CSSProperties = {
    fontSize: 13,
    fontWeight: 700,
    color: '#333',
    marginBottom: 14,
    letterSpacing: -0.2,
  };

  // ─────────────────────────────────────
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        background: '#f7f7f8',
      }}
    >
      {/* shimmer keyframe */}
      <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        .sb-link:hover { background: rgba(0,0,0,0.04) !important; color: #111 !important; }
        .qa-card:hover { background: #f5f7ff !important; border-color: #c5d3f8 !important; }
        .refetch-btn:hover { background: #f0f0f0 !important; }
      `}</style>

      <Navbar isLoggedIn={isLoggedIn} isAdmin={isAdmin} userName={userName} />

      <div style={{ display: 'flex', flex: 1 }}>
        {/* ── 사이드바 ────────────────── */}
        <aside
          style={{
            width: 220,
            flexShrink: 0,
            background: '#fff',
            borderRight: '1px solid #ebebeb',
            display: 'flex',
            flexDirection: 'column',
            paddingTop: 16,
            position: 'sticky',
            top: 64, // Navbar 높이
            height: 'calc(100vh - 64px)',
            overflowY: 'auto',
          }}
        >
          {/* 로고 영역 */}
          <div
            style={{
              padding: '0 18px 16px',
              borderBottom: '1px solid #f0f0f0',
              marginBottom: 8,
            }}
          >
            <div
              style={{
                fontSize: 15,
                fontWeight: 800,
                color: '#111',
                letterSpacing: -0.3,
              }}
            >
              MOA Admin
            </div>
            <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>
              관리자 패널
            </div>
          </div>

          {/* 메뉴 */}
          {MENU_ITEMS.map((item, idx) => {
            const active = isActive(item.path);
            const parentActive = isParentActive(item);
            const open = openMenus.has(item.key);

            return (
              <div key={item.key}>
                {/* 구분선 */}
                {(idx === 2 || idx === 4 || idx === 6) && (
                  <div
                    style={{
                      height: 1,
                      background: '#f2f2f2',
                      margin: '6px 12px',
                    }}
                  />
                )}

                <button
                  className="sb-link"
                  onClick={() => {
                    if (item.children) {
                      toggleMenu(item.key);
                    } else if (item.path) {
                      navigate(item.path);
                    }
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '9px 18px',
                    background: active || parentActive ? '#f0f4ff' : 'none',
                    border: 'none',
                    borderLeft:
                      active || parentActive
                        ? '3px solid #5b8dee'
                        : '3px solid transparent',
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: active || parentActive ? 700 : 400,
                    color: active || parentActive ? '#3a6bdb' : '#555',
                    textAlign: 'left',
                    transition: 'all 0.15s',
                  }}
                >
                  <span
                    style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                  >
                    <span style={{ fontSize: 14, lineHeight: 1 }}>
                      {item.icon}
                    </span>
                    {item.label}
                  </span>
                  {item.children && (
                    <span
                      style={{
                        fontSize: 10,
                        color: '#bbb',
                        transform: open ? 'rotate(180deg)' : 'none',
                        transition: 'transform 0.2s',
                      }}
                    >
                      ▼
                    </span>
                  )}
                </button>

                {/* 서브메뉴 */}
                {item.children && open && (
                  <div style={{ paddingBottom: 4 }}>
                    {item.children.map((child) => (
                      <button
                        key={child.key}
                        className="sb-link"
                        onClick={() => navigate(child.path)}
                        style={{
                          display: 'block',
                          width: '100%',
                          padding: '7px 18px 7px 42px',
                          background: isActive(child.path) ? '#f0f4ff' : 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: 12,
                          color: isActive(child.path) ? '#3a6bdb' : '#888',
                          fontWeight: isActive(child.path) ? 600 : 400,
                          textAlign: 'left',
                        }}
                      >
                        └ {child.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </aside>

        {/* ── 메인 콘텐츠 ─────────────── */}
        <main style={{ flex: 1, padding: '32px 28px 64px', minWidth: 0 }}>
          {/* 헤더 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              marginBottom: 28,
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: 24,
                  fontWeight: 900,
                  color: '#111',
                  letterSpacing: -0.5,
                  margin: '0 0 4px',
                }}
              >
                관리자 대시보드
              </h1>
              <p style={{ fontSize: 13, color: '#aaa', margin: 0 }}>
                moa 서비스 관리 현황
              </p>
            </div>
            <button
              className="refetch-btn"
              onClick={refetchMain}
              style={{
                padding: '7px 14px',
                fontSize: 12,
                color: '#666',
                background: '#fff',
                border: '1px solid #e5e5e5',
                borderRadius: 8,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              ↻ 새로고침
            </button>
          </div>

          {/* 에러 배너 */}
          {mainError && (
            <div
              style={{
                background: '#fff5f5',
                border: '1px solid #fecaca',
                borderRadius: 10,
                padding: '12px 16px',
                marginBottom: 20,
                fontSize: 13,
                color: '#c0392b',
              }}
            >
              ⚠️ 데이터를 불러오지 못했습니다 — {mainError}
            </div>
          )}

          {/* ── Row 1: KPI 카드 4개 ──── */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 14,
              marginBottom: 18,
            }}
          >
            {[
              {
                label: '전체 유저',
                value: loading ? null : fmtNum(userCount?.countTotalUser ?? 0),
                sub: loading
                  ? null
                  : `남 ${userCount?.maleRatio ?? 0}% · 여 ${userCount?.femaleRatio ?? 0}%`,
                color: '#5b8dee',
              },
              {
                label: '모임 참여율',
                value: loading ? null : `${joinRate}%`,
                sub: loading
                  ? null
                  : `${fmtNum(userCount?.countJoinUser ?? 0)}명 참여 중`,
                color: '#34c77b',
              },
              {
                label: '전체 모임 수',
                value: loading ? null : fmtNum(circleSummary?.circleCount ?? 0),
                sub: loading
                  ? null
                  : `카테고리 ${circleSummary?.circleDataDTOs.length ?? 0}개`,
                color: '#f5a623',
              },
              {
                label: `${userStatus?.month ?? '-'}월 가입 / 탈퇴`,
                value: loading
                  ? null
                  : `${fmtNum(userStatus?.signUpCount ?? 0)} / ${fmtNum(userStatus?.withdrawnCount ?? 0)}`,
                sub: loading ? null : `기준일 ${userStatus?.date ?? '-'}일`,
                color: '#a47ef5',
              },
            ].map((kpi) => (
              <div
                key={kpi.label}
                style={{ ...card, borderTop: `3px solid ${kpi.color}` }}
              >
                <div style={{ fontSize: 12, color: '#aaa', marginBottom: 8 }}>
                  {kpi.label}
                </div>
                {kpi.value === null ? (
                  <>
                    <Skeleton height={30} radius={4} />
                    <div style={{ marginTop: 8 }}>
                      <Skeleton height={12} width="60%" radius={3} />
                    </div>
                  </>
                ) : (
                  <>
                    <div
                      style={{
                        fontSize: 28,
                        fontWeight: 900,
                        color: '#111',
                        letterSpacing: -1,
                        lineHeight: 1.1,
                      }}
                    >
                      {kpi.value}
                    </div>
                    <div style={{ fontSize: 12, color: '#aaa', marginTop: 5 }}>
                      {kpi.sub}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* ── Row 2: 성비 + 카테고리 + 게시글 활동 ── */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1.6fr 1.2fr',
              gap: 14,
              marginBottom: 18,
            }}
          >
            {/* 성비 도넛 */}
            <div style={card}>
              <div style={cardTitle}>성별 분포</div>
              {loading ? (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  <Skeleton width={96} height={96} radius={48} />
                </div>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  <DonutChart
                    male={Math.round(userCount?.maleRatio ?? 50)}
                    female={Math.round(userCount?.femaleRatio ?? 50)}
                  />
                  <div style={{ display: 'flex', gap: 16 }}>
                    {[
                      {
                        color: '#5b8dee',
                        label: `남성 ${userCount?.maleRatio ?? 0}%`,
                        count: userCount?.maleUser,
                      },
                      {
                        color: '#e88a9a',
                        label: `여성 ${userCount?.femaleRatio ?? 0}%`,
                        count: userCount?.femaleUser,
                      },
                    ].map((item) => (
                      <div key={item.label} style={{ textAlign: 'center' }}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            marginBottom: 2,
                          }}
                        >
                          <div
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              background: item.color,
                            }}
                          />
                          <span style={{ fontSize: 11, color: '#888' }}>
                            {item.label}
                          </span>
                        </div>
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: '#333',
                          }}
                        >
                          {fmtNum(item.count ?? 0)}명
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 모임 카테고리 분포 */}
            <div style={card}>
              <div style={cardTitle}>모임 카테고리 분포</div>
              {loading ? (
                <div
                  style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
                >
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} height={10} radius={4} />
                  ))}
                </div>
              ) : (
                <CategoryBars data={circleSummary?.circleDataDTOs ?? []} />
              )}
            </div>

            {/* 게시글 활동 */}
            <div style={card}>
              <div style={cardTitle}>게시글 활동</div>
              {postLoading ? (
                <div
                  style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
                >
                  <Skeleton height={32} radius={4} />
                  <Skeleton height={52} radius={4} />
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', gap: 20, marginBottom: 14 }}>
                    {[
                      {
                        label: '오늘 게시글',
                        value: postData?.todayPostCount ?? 0,
                        color: '#34c77b',
                      },
                      {
                        label: '오늘 댓글',
                        value: postData?.todayReplyCount ?? 0,
                        color: '#5b8dee',
                      },
                    ].map((s) => (
                      <div key={s.label}>
                        <div
                          style={{
                            fontSize: 24,
                            fontWeight: 900,
                            color: '#111',
                            letterSpacing: -0.5,
                          }}
                        >
                          {fmtNum(s.value)}
                        </div>
                        <div
                          style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}
                        >
                          {s.label}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: 11, color: '#bbb', marginBottom: 6 }}>
                    주간 게시글
                  </div>
                  <MiniBarChart
                    data={postData?.weeklyPosts ?? []}
                    color="#34c77b"
                  />
                  <div
                    style={{
                      fontSize: 11,
                      color: '#bbb',
                      marginTop: 10,
                      marginBottom: 6,
                    }}
                  >
                    주간 댓글
                  </div>
                  <MiniBarChart
                    data={postData?.weeklyReplies ?? []}
                    color="#5b8dee"
                  />
                </>
              )}
            </div>
          </div>

          {/* ── Row 3: 월별 추이 + 인기모임 TOP5 ── */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.7fr 1fr',
              gap: 14,
              marginBottom: 18,
            }}
          >
            {/* 월별 추이 */}
            <div style={card}>
              <div style={cardTitle}>
                월별 가입자 · 탈퇴자 추이
                <span
                  style={{
                    fontWeight: 400,
                    fontSize: 11,
                    color: '#bbb',
                    marginLeft: 6,
                  }}
                >
                  최근 12개월
                </span>
              </div>
              {loading ? (
                <Skeleton height={80} radius={4} />
              ) : (
                <MonthlyChart
                  signUp={chartData?.signUpChart ?? []}
                  withdrawn={chartData?.withdrawnChart ?? []}
                />
              )}
            </div>

            {/* 인기 모임 TOP5 — 현재는 circleSummary 데이터로 대체 표시 */}
            <div style={card}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 14,
                }}
              >
                <span style={cardTitle as React.CSSProperties}>
                  인기 모임 TOP 5
                </span>
                <button
                  onClick={() => navigate('/admin/circles')}
                  style={{
                    fontSize: 11,
                    color: '#5b8dee',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  전체 보기 →
                </button>
              </div>
              {loading ? (
                <div
                  style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
                >
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} height={18} radius={4} />
                  ))}
                </div>
              ) : (
                /* 실제 데이터: GET /api/admin/circles/popular — 추후 연결 */
                /* 현재는 mock 데이터로 표시 */
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {[
                    ['📚 조용한 독서모임', '24/30'],
                    ['🎨 수채화 클래스', '18/20'],
                    ['🍳 집밥 레시피', '15/20'],
                    ['🚶 저속 산책', '13/15'],
                    ['🎮 보드게임 살롱', '12/15'],
                  ].map(([name, count], i) => (
                    <div
                      key={name}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '9px 0',
                        borderBottom: i < 4 ? '1px solid #f5f5f5' : 'none',
                      }}
                    >
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: i < 3 ? '#5b8dee' : '#bbb',
                          minWidth: 16,
                        }}
                      >
                        {i + 1}
                      </span>
                      <span style={{ flex: 1, fontSize: 13, color: '#333' }}>
                        {name}
                      </span>
                      <span style={{ fontSize: 12, color: '#aaa' }}>
                        {count}
                      </span>
                    </div>
                  ))}
                  <p
                    style={{
                      fontSize: 10,
                      color: '#ccc',
                      marginTop: 8,
                      marginBottom: 0,
                    }}
                  >
                    * 실제 데이터: GET /api/admin/circles/popular 연결 필요
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── Row 4: 빠른 작업 ── */}
          <div style={card}>
            <div style={cardTitle}>빠른 작업</div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(8, 1fr)',
                gap: 10,
              }}
            >
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.path}
                  className="qa-card"
                  onClick={() => navigate(action.path)}
                  style={{
                    background: '#fafafa',
                    border: '1px solid #ebebeb',
                    borderRadius: 10,
                    padding: '14px 8px',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ fontSize: 20, marginBottom: 6 }}>
                    {action.icon}
                  </div>
                  <div style={{ fontSize: 11, color: '#666', lineHeight: 1.4 }}>
                    {action.label}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
