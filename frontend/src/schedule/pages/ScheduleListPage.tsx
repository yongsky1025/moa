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
      <main style={{ maxWidth: 760, margin: '0 auto', padding: '32px 20px 60px' }}>

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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {schedules.map(s => {
              const statusInfo = STATUS_LABEL[s.status];
              return (
                <div
                  key={s.scheduleId}
                  onClick={() => navigate(`/circle/${cid}/schedules/${s.scheduleId}`)}
                  style={{
                    backgroundColor: 'white', borderRadius: 12,
                    padding: '18px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    cursor: 'pointer', border: '1px solid #f0f0f0', transition: 'box-shadow 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)')}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)')}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ marginBottom: 6 }}>
                        <span style={{
                          fontSize: 11, fontWeight: 700, padding: '2px 8px',
                          borderRadius: 999, backgroundColor: statusInfo.bg, color: statusInfo.color,
                        }}>
                          {statusInfo.text}
                        </span>
                      </div>
                      <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111', marginBottom: 8 }}>
                        {s.title}
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#666' }}>
                          <Clock size={13} />
                          <span>{formatDate(s.startAt)} ~ {formatDate(s.endAt)}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#666' }}>
                          <Users size={13} />
                          <span>최대 {s.maxMember}명</span>
                        </div>
                      </div>
                    </div>
                    <span style={{ fontSize: 20, color: '#ccc', marginLeft: 12 }}>›</span>
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
