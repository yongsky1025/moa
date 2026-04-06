import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import Navbar from '../../common/layout/Navbar';
import Footer from '../../common/layout/Footer';
import { scheduleApi } from '../../api/scheduleApi';
import { getErrorMessage } from '../../common/utils/errorMessage';
import type { ScheduleResponse } from '../types/schedule';

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

export default function ScheduleListPage() {
  const { circleId } = useParams<{ circleId: string }>();
  const cid = Number(circleId);
  const navigate = useNavigate();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [schedules, setSchedules] = useState<ScheduleResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  useEffect(() => {
    if (!circleId || isNaN(cid)) { navigate('/circle', { replace: true }); return; }
    setLoading(true);
    setError('');
    const y = currentMonth.getFullYear();
    const m = currentMonth.getMonth();
    scheduleApi.getSchedules(cid, {
      from: toLocalISO(new Date(y, m, 1, 0, 0, 0)),
      to:   toLocalISO(new Date(y, m + 1, 0, 23, 59, 59)),
    })
      .then(res => setSchedules(res.data))
      .catch(e => setError(getErrorMessage(e)))
      .finally(() => setLoading(false));
  }, [cid, currentMonth]);

  const schedulesByDay = schedules.reduce<Record<number, ScheduleResponse[]>>((acc, s) => {
    const day = new Date(s.startAt).getDate();
    if (!acc[day]) acc[day] = [];
    acc[day].push(s);
    return acc;
  }, {});

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f7f7f8' }}>
      <Navbar />
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 20px 60px' }}>

        {/* 헤더 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <button
              onClick={() => navigate(`/circle/${cid}`)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#888', marginBottom: 6, padding: 0 }}
            >
              ← 서클로 돌아가기
            </button>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111' }}>일정</h1>
          </div>
          <button
            onClick={() => navigate(`/circle/${cid}/schedules/create`)}
            style={{ padding: '9px 18px', borderRadius: 8, border: 'none', backgroundColor: '#5F8F7B', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
          >
            + 일정 만들기
          </button>
        </div>

        {error && (
          <p style={{ color: '#dc2626', fontSize: 13, marginBottom: 16, padding: '10px 14px', backgroundColor: '#fef2f2', borderRadius: 8 }}>
            {error}
          </p>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 20, alignItems: 'start' }}>

          {/* ── 왼쪽: 목록 ── */}
          <div style={{ backgroundColor: 'white', borderRadius: 16, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#555', marginBottom: 14 }}>
              {year}년 {month + 1}월 일정
            </div>
            {loading ? (
              <p style={{ textAlign: 'center', color: '#888', padding: '40px 0', fontSize: 13 }}>로딩 중...</p>
            ) : schedules.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#aaa' }}>
                <p style={{ fontSize: 14, marginBottom: 4 }}>이달 일정이 없습니다.</p>
                <p style={{ fontSize: 12 }}>새 일정을 만들어보세요!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {schedules.map(s => {
                  const statusInfo = STATUS_LABEL[s.status];
                  const startDate = new Date(s.startAt);
                  const sMonth = startDate.getMonth() + 1;
                  const sDay = startDate.getDate();
                  const timeStr = startDate.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
                  return (
                    <div
                      key={s.scheduleId}
                      onClick={() => navigate(`/circle/${cid}/schedules/${s.scheduleId}`)}
                      style={{
                        padding: '12px 14px', borderRadius: 10, cursor: 'pointer',
                        border: '1px solid #f0f0f0', backgroundColor: '#fafafa',
                        display: 'flex', alignItems: 'flex-start', gap: 12, transition: 'background 0.1s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f0f4ff')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#fafafa')}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 32, flexShrink: 0 }}>
                        <span style={{ fontSize: 10, color: '#aaa', fontWeight: 500 }}>{sMonth}월</span>
                        <span style={{ fontSize: 20, fontWeight: 800, color: '#111', lineHeight: 1.1 }}>{sDay}</span>
                      </div>
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
                        <div style={{ display: 'flex', gap: 10 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#888' }}>
                            <Clock size={11} /><span>{timeStr}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#888' }}>
                            <Users size={11} /><span>{s.currentMember ?? 0}/{s.maxMember}명</span>
                          </div>
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
                style={{ background: 'none', border: '1px solid #e5e5e5', borderRadius: 8, padding: '5px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
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
                      backgroundColor: isToday ? '#f0f9ff' : '#fafafa',
                      border: isToday ? '1.5px solid #bae6fd' : '1px solid #f0f0f0',
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
                          onClick={() => navigate(`/circle/${cid}/schedules/${s.scheduleId}`)}
                          title={s.title}
                          style={{
                            fontSize: 10, fontWeight: 600, padding: '2px 5px', borderRadius: 4,
                            backgroundColor: si.bg, color: si.color,
                            marginBottom: 2, cursor: 'pointer',
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

      </main>
      <Footer />
    </div>
  );
}
