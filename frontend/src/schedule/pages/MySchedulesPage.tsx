import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Users, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import Navbar from '../../common/layout/Navbar';
import Footer from '../../common/layout/Footer';
import { scheduleApi } from '../../api/scheduleApi';
import type { ScheduleResponse } from '../../schedule/types/schedule';

const STATUS_LABEL = {
  UPCOMING:    { text: '예정',   color: '#2563eb', bg: '#dbeafe' },
  IN_PROGRESS: { text: '진행중', color: '#16a34a', bg: '#dcfce7' },
  COMPLETED:   { text: '완료',   color: '#6b7280', bg: '#f3f4f6' },
};

const DAYS = ['일', '월', '화', '수', '목', '금', '토'];

function toLocalISO(date: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function formatRelativeDay(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'D-day';
  if (diffDays > 0) return `D-${diffDays}`;
  return '';
}

type Tab = 'upcoming' | 'completed';

export default function MySchedulesPage() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<Tab>('upcoming');
  const [upcomingSchedules, setUpcomingSchedules] = useState<ScheduleResponse[]>([]);
  const [completedSchedules, setCompletedSchedules] = useState<ScheduleResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 캘린더 월 (탭별로 분리)
  const [upcomingMonth, setUpcomingMonth] = useState(new Date());
  const [completedMonth, setCompletedMonth] = useState(new Date());

  const today = new Date();

  useEffect(() => {
    setLoading(true);
    setError('');
    const now = new Date();
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    const oneYearLater = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());

    Promise.all([
      scheduleApi.getMySchedules({
        from: toLocalISO(now),
        to: toLocalISO(oneYearLater),
      }),
      scheduleApi.getMySchedules({
        from: toLocalISO(oneYearAgo),
        to: toLocalISO(now),
      }),
    ])
      .then(([upcomingRes, completedRes]) => {
        setUpcomingSchedules(
          upcomingRes.data
            .filter(s => s.status === 'UPCOMING' || s.status === 'IN_PROGRESS')
            .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())
        );
        setCompletedSchedules(
          completedRes.data
            .filter(s => s.status === 'COMPLETED')
            .sort((a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime())
        );
      })
      .catch(() => setError('일정을 불러올 수 없습니다.'))
      .finally(() => setLoading(false));
  }, []);

  const handleClick = (s: ScheduleResponse) => {
    if (s.circleId) navigate(`/circle/${s.circleId}/schedules/${s.scheduleId}`);
  };

  // 현재 탭에서 사용할 데이터/월
  const currentMonth = activeTab === 'upcoming' ? upcomingMonth : completedMonth;
  const setCurrentMonth = activeTab === 'upcoming' ? setUpcomingMonth : setCompletedMonth;
  const allSchedules = activeTab === 'upcoming' ? upcomingSchedules : completedSchedules;

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // 달력에 표시할 일정 (선택된 월 기준)
  const schedulesByDay = allSchedules.reduce<Record<number, ScheduleResponse[]>>((acc, s) => {
    const d = new Date(s.startAt);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate();
      if (!acc[day]) acc[day] = [];
      acc[day].push(s);
    }
    return acc;
  }, {});

  // 목록에 표시할 일정
  // upcoming: 전체 (최대 20개), completed: 선택 월 필터
  const listSchedules = activeTab === 'upcoming'
    ? allSchedules.slice(0, 20)
    : allSchedules.filter(s => {
        const d = new Date(s.startAt);
        return d.getFullYear() === year && d.getMonth() === month;
      });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f7f7f8' }}>
      <Navbar />
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 20px 60px' }}>

        {/* 헤더 */}
        <div style={{ marginBottom: 24 }}>
          <button
            onClick={() => navigate('/users/profile')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#888', marginBottom: 6, padding: 0 }}
          >
            ← 마이페이지로 돌아가기
          </button>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111' }}>내 일정</h1>
        </div>

        {/* 탭 */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 20, borderBottom: '2px solid #f0f0f0' }}>
          {([
            { key: 'upcoming', label: `예정된 일정`, count: upcomingSchedules.length },
            { key: 'completed', label: `참석한 일정`, count: completedSchedules.length },
          ] as { key: Tab; label: string; count: number }[]).map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '12px 20px', fontSize: 14, fontWeight: activeTab === tab.key ? 700 : 500,
                color: activeTab === tab.key ? '#5F8F7B' : '#888',
                background: 'none', border: 'none',
                borderBottom: activeTab === tab.key ? '2px solid #5F8F7B' : '2px solid transparent',
                marginBottom: -2, cursor: 'pointer', transition: 'color 0.15s',
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              {tab.label}
              <span style={{
                fontSize: 11, fontWeight: 700, padding: '1px 7px', borderRadius: 999,
                backgroundColor: activeTab === tab.key ? '#EAF4F0' : '#f3f4f6',
                color: activeTab === tab.key ? '#4E7C69' : '#999',
              }}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {error && (
          <p style={{ color: '#dc2626', fontSize: 13, marginBottom: 16, padding: '10px 14px', backgroundColor: '#fef2f2', borderRadius: 8 }}>
            {error}
          </p>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#aaa', fontSize: 14 }}>로딩 중...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 20, alignItems: 'start' }}>

            {/* ── 왼쪽: 목록 ── */}
            <div style={{ backgroundColor: 'white', borderRadius: 16, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#555', marginBottom: 14 }}>
                {activeTab === 'upcoming'
                  ? `다가오는 일정 ${upcomingSchedules.length}개`
                  : `${year}년 ${month + 1}월 · ${listSchedules.length}개`
                }
              </div>

              {listSchedules.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#aaa' }}>
                  <p style={{ fontSize: 14 }}>
                    {activeTab === 'upcoming' ? '예정된 일정이 없습니다.' : '이달 참석한 일정이 없습니다.'}
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {listSchedules.map(s => {
                    const statusInfo = STATUS_LABEL[s.status];
                    const startDate = new Date(s.startAt);
                    const sMonth = startDate.getMonth() + 1;
                    const sDay = startDate.getDate();
                    const timeStr = startDate.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
                    const dTag = activeTab === 'upcoming' ? formatRelativeDay(s.startAt) : '';
                    return (
                      <div
                        key={s.scheduleId}
                        onClick={() => handleClick(s)}
                        style={{
                          padding: '12px 14px', borderRadius: 10, cursor: s.circleId ? 'pointer' : 'default',
                          border: '1px solid #f0f0f0', backgroundColor: '#fafafa',
                          display: 'flex', alignItems: 'flex-start', gap: 12, transition: 'background 0.1s',
                        }}
                        onMouseEnter={e => { if (s.circleId) e.currentTarget.style.backgroundColor = '#f0f7f4'; }}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#fafafa')}
                      >
                        {/* 날짜 */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 36, flexShrink: 0 }}>
                          <span style={{ fontSize: 10, color: '#aaa', fontWeight: 500 }}>{sMonth}월</span>
                          <span style={{ fontSize: 20, fontWeight: 800, color: '#111', lineHeight: 1.1 }}>{sDay}</span>
                          {dTag && (
                            <span style={{
                              marginTop: 2, fontSize: 9, fontWeight: 700, padding: '1px 4px',
                              borderRadius: 4, backgroundColor: '#EAF4F0', color: '#4E7C69',
                            }}>
                              {dTag}
                            </span>
                          )}
                        </div>

                        {/* 내용 */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                            <span style={{
                              fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 999,
                              backgroundColor: statusInfo.bg, color: statusInfo.color,
                            }}>
                              {statusInfo.text}
                            </span>
                          </div>
                          <h3 style={{ fontSize: 13, fontWeight: 700, color: '#111', marginBottom: 5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {s.title}
                          </h3>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#888' }}>
                              <Clock size={11} /><span>{timeStr}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#888' }}>
                              <Users size={11} /><span>{s.currentMember ?? 0}/{s.maxMember}명</span>
                            </div>
                            {s.location && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 120 }}>
                                <MapPin size={11} /><span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.location}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ── 오른쪽: 캘린더 ── */}
            <div style={{ backgroundColor: 'white', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>

              {/* 월 네비게이션 */}
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 20, marginBottom: 20 }}>
                <button
                  onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}
                  disabled={activeTab === 'upcoming' && new Date(year, month - 1, 1) < new Date(today.getFullYear(), today.getMonth(), 1)}
                  style={{
                    background: 'none', border: '1px solid #e5e5e5', borderRadius: 8,
                    padding: '5px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center',
                    opacity: (activeTab === 'upcoming' && new Date(year, month - 1, 1) < new Date(today.getFullYear(), today.getMonth(), 1)) ? 0.3 : 1,
                  }}
                >
                  <ChevronLeft size={16} />
                </button>
                <span style={{ fontSize: 16, fontWeight: 700, color: '#111', minWidth: 110, textAlign: 'center' }}>
                  {year}년 {month + 1}월
                </span>
                <button
                  onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}
                  style={{ background: 'none', border: '1px solid #e5e5e5', borderRadius: 8, padding: '5px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              {/* 요일 헤더 */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 4 }}>
                {DAYS.map((d, i) => (
                  <div key={d} style={{
                    textAlign: 'center', fontSize: 12, fontWeight: 600, padding: '6px 0',
                    color: i === 0 ? '#ef4444' : i === 6 ? '#3b82f6' : '#888',
                  }}>
                    {d}
                  </div>
                ))}
              </div>

              {/* 날짜 그리드 */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3 }}>
                {Array.from({ length: firstWeekday }).map((_, i) => (
                  <div key={`empty-${i}`} style={{ minHeight: 80 }} />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const daySchedules = schedulesByDay[day] ?? [];
                  const col = (firstWeekday + i) % 7;
                  const isToday =
                    today.getFullYear() === year &&
                    today.getMonth() === month &&
                    today.getDate() === day;
                  return (
                    <div
                      key={day}
                      style={{
                        minHeight: 80, borderRadius: 8, padding: '5px 4px',
                        backgroundColor: isToday ? '#f0fdf4' : '#fafafa',
                        border: isToday ? '1.5px solid #A9C8BB' : '1px solid #f0f0f0',
                      }}
                    >
                      <span style={{
                        fontSize: 12, fontWeight: 700, display: 'block', textAlign: 'center', marginBottom: 4,
                        color: col === 0 ? '#ef4444' : col === 6 ? '#3b82f6' : '#333',
                      }}>
                        {day}
                      </span>
                      {daySchedules.map(s => {
                        const si = STATUS_LABEL[s.status];
                        return (
                          <div
                            key={s.scheduleId}
                            onClick={() => handleClick(s)}
                            title={s.title}
                            style={{
                              fontSize: 10, fontWeight: 600, padding: '2px 5px', borderRadius: 4,
                              backgroundColor: si.bg, color: si.color,
                              marginBottom: 2, cursor: s.circleId ? 'pointer' : 'default',
                              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            }}
                          >
                            {s.title}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>

            </div>
          </div>
        )}

      </main>
      <Footer />
    </div>
  );
}
