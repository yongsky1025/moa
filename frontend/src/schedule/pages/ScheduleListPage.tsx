import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Users } from 'lucide-react';
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

function formatDate(dt: string) {
  return new Date(dt).toLocaleString('ko-KR', {
    month: 'numeric', day: 'numeric', weekday: 'short',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function ScheduleListPage() {
  const { circleId } = useParams<{ circleId: string }>();
  const cid = Number(circleId);
  const navigate = useNavigate();

  const [schedules, setSchedules] = useState<ScheduleResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!circleId || isNaN(cid)) { navigate('/circle', { replace: true }); return; }
    scheduleApi.getSchedules(cid)
      .then(res => setSchedules(res.data))
      .catch(e => setError(getErrorMessage(e)))
      .finally(() => setLoading(false));
  }, [cid]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f7f7f8' }}>
      <Navbar />
      <main style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px 60px' }}>

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
            style={{ padding: '9px 18px', borderRadius: 8, border: 'none', backgroundColor: '#111', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
          >
            + 일정 만들기
          </button>
        </div>

        {error && (
          <p style={{ color: '#dc2626', fontSize: 13, marginBottom: 16, padding: '10px 14px', backgroundColor: '#fef2f2', borderRadius: 8 }}>
            {error}
          </p>
        )}

        {loading ? (
          <p style={{ textAlign: 'center', color: '#888', padding: '60px 0' }}>로딩 중...</p>
        ) : schedules.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#aaa' }}>
            <p style={{ fontSize: 15, marginBottom: 8 }}>아직 일정이 없습니다.</p>
            <p style={{ fontSize: 13 }}>첫 번째 일정을 만들어보세요!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {schedules.map(s => {
              const statusInfo = STATUS_LABEL[s.status];
              const startDate = new Date(s.startAt);
              const month = startDate.getMonth() + 1;
              const day = startDate.getDate();
              const timeStr = startDate.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
              return (
                <div
                  key={s.scheduleId}
                  onClick={() => navigate(`/circle/${cid}/schedules/${s.scheduleId}`)}
                  style={{
                    backgroundColor: 'white', borderRadius: 12,
                    padding: '16px 18px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    cursor: 'pointer', border: '1px solid #f0f0f0', transition: 'box-shadow 0.15s',
                    display: 'flex', alignItems: 'flex-start', gap: 14,
                  }}
                  onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)')}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)')}
                >
                  {/* 날짜 */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 36 }}>
                    <span style={{ fontSize: 11, color: '#888', fontWeight: 500 }}>{month}월</span>
                    <span style={{ fontSize: 22, fontWeight: 800, color: '#111', lineHeight: 1.1 }}>{day}</span>
                  </div>

                  {/* 내용 */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {s.title}
                    </h3>
                    <span style={{
                      fontSize: 11, fontWeight: 700, color: statusInfo.color,
                      display: 'block', marginBottom: 8,
                    }}>
                      {statusInfo.text}
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#888' }}>
                        <Clock size={12} />
                        <span>{timeStr}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#888' }}>
                        <Users size={12} />
                        <span>{s.currentMember ?? 0}/{s.maxMember}명</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
