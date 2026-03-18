import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Users, MapPin } from 'lucide-react';
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
    year: 'numeric', month: 'long', day: 'numeric',
    weekday: 'long', hour: '2-digit', minute: '2-digit',
  });
}

export default function ScheduleDetailPage() {
  const { circleId, scheduleId } = useParams<{ circleId: string; scheduleId: string }>();
  const cid = Number(circleId);
  const sid = Number(scheduleId);
  const navigate = useNavigate();

  const [schedule, setSchedule] = useState<ScheduleResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [kakaoReady, setKakaoReady] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  // Kakao Maps SDK 대기
  useEffect(() => {
    const timer = setInterval(() => {
      if (typeof kakao !== 'undefined' && kakao.maps) {
        clearInterval(timer);
        kakao.maps.load(() => setKakaoReady(true));
      }
    }, 100);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!circleId || !scheduleId || isNaN(cid) || isNaN(sid)) {
      navigate(`/circle/${circleId}/schedules`, { replace: true });
      return;
    }
    scheduleApi.getSchedule(cid, sid)
      .then(res => setSchedule(res.data))
      .catch(e => setMsg(`오류: ${getErrorMessage(e)}`))
      .finally(() => setLoading(false));
  }, [cid, sid]);

  // 카카오맵 초기화
  useEffect(() => {
    if (!kakaoReady || !schedule?.latitude || !schedule?.longitude || !mapContainerRef.current) return;
    if (mapRef.current) return;

    const position = new kakao.maps.LatLng(schedule.latitude, schedule.longitude);
    const map = new kakao.maps.Map(mapContainerRef.current, { center: position, level: 4 });
    mapRef.current = map;

    const marker = new kakao.maps.Marker({ map, position });
    if (schedule.location) {
      const infowindow = new kakao.maps.InfoWindow({
        content: `<div style="padding:8px 12px;font-size:13px;font-weight:600;white-space:nowrap;max-width:200px;overflow:hidden;text-overflow:ellipsis;">${schedule.location}</div>`,
      });
      infowindow.open(map, marker);
    }
  }, [kakaoReady, schedule]);

  const action = async (fn: () => Promise<unknown>, successMsg: string) => {
    try {
      await fn();
      setMsg(successMsg);
    } catch (e) {
      setMsg(`오류: ${getErrorMessage(e)}`);
    }
  };

  const handleJoin = () =>
    action(() => scheduleApi.joinSchedule(cid, sid), '일정에 참여했습니다.');

  const handleCancel = () => {
    if (!confirm('참여를 취소하시겠습니까?')) return;
    action(() => scheduleApi.cancelSchedule(cid, sid), '참여를 취소했습니다.');
  };

  const handleDelete = () => {
    if (!confirm('일정을 삭제하시겠습니까? 복구할 수 없습니다.')) return;
    action(async () => {
      await scheduleApi.deleteSchedule(cid, sid);
      navigate(`/circle/${cid}/schedules`);
    }, '삭제됐습니다.');
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f7f7f8' }}>
      <Navbar />
      <p style={{ textAlign: 'center', padding: '80px 0', color: '#888' }}>로딩 중...</p>
      <Footer />
    </div>
  );

  if (!schedule) return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f7f7f8' }}>
      <Navbar />
      <p style={{ textAlign: 'center', padding: '80px 0', color: '#dc2626' }}>일정을 찾을 수 없습니다.</p>
      <Footer />
    </div>
  );

  const statusInfo = STATUS_LABEL[schedule.status];
  const isUpcoming = schedule.status === 'UPCOMING';
  const hasLocation = !!(schedule.latitude && schedule.longitude);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f7f7f8' }}>
      <Navbar />
      <main style={{ maxWidth: hasLocation ? 1100 : 640, margin: '0 auto', padding: '32px 20px 60px' }}>
        <button
          onClick={() => navigate(`/circle/${cid}/schedules`)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#888', marginBottom: 20, padding: 0 }}
        >
          ← 일정 목록으로
        </button>

        {msg && (
          <div style={{
            marginBottom: 16, padding: '10px 14px', borderRadius: 8, fontSize: 13,
            backgroundColor: msg.startsWith('오류') ? '#fef2f2' : '#f0fdf4',
            color: msg.startsWith('오류') ? '#dc2626' : '#16a34a',
          }}>
            {msg}
          </div>
        )}

        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>

          {/* 일정 정보 카드 */}
          <div style={{ backgroundColor: 'white', borderRadius: 16, padding: 28, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', flex: hasLocation ? '0 0 420px' : '1' }}>
            <div style={{ marginBottom: 12 }}>
              <span style={{
                fontSize: 12, fontWeight: 700, padding: '3px 10px',
                borderRadius: 999, backgroundColor: statusInfo.bg, color: statusInfo.color,
              }}>
                {statusInfo.text}
              </span>
            </div>

            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111', marginBottom: 16 }}>
              {schedule.title}
            </h1>

            <p style={{ fontSize: 14, color: '#555', lineHeight: 1.7, marginBottom: 24, whiteSpace: 'pre-wrap' }}>
              {schedule.description}
            </p>

            <div style={{
              display: 'flex', flexDirection: 'column', gap: 10,
              padding: '16px 0', borderTop: '1px solid #f0f0f0',
              borderBottom: '1px solid #f0f0f0', marginBottom: 24,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#555' }}>
                <Clock size={16} style={{ color: '#888', flexShrink: 0 }} />
                <span>시작: {formatDate(schedule.startAt)}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#555' }}>
                <Clock size={16} style={{ color: '#888', flexShrink: 0 }} />
                <span>종료: {formatDate(schedule.endAt)}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#555' }}>
                <Users size={16} style={{ color: '#888', flexShrink: 0 }} />
                <span>최대 인원: {schedule.maxMember}명</span>
              </div>
              {schedule.location && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#555' }}>
                  <MapPin size={16} style={{ color: '#888', flexShrink: 0 }} />
                  <span>{schedule.location}</span>
                </div>
              )}
            </div>

            {/* 액션 버튼 */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {isUpcoming && !schedule.joined && (
                <button
                  onClick={handleJoin}
                  style={{ padding: '10px 20px', borderRadius: 8, border: 'none', backgroundColor: '#111', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                >
                  참여하기
                </button>
              )}
              {isUpcoming && schedule.joined && (
                <button
                  onClick={handleCancel}
                  style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid #fca5a5', backgroundColor: 'white', color: '#dc2626', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                >
                  참여 취소
                </button>
              )}
              <button
                onClick={() => navigate(`/circle/${cid}/schedules/${sid}/edit`)}
                style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid #e5e5e5', backgroundColor: 'white', color: '#333', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              >
                수정
              </button>
              <button
                onClick={handleDelete}
                style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid #fca5a5', backgroundColor: 'white', color: '#dc2626', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              >
                삭제
              </button>
            </div>
          </div>

          {/* 카카오 맵 (장소 지정된 경우만) */}
          {hasLocation && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ backgroundColor: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                {schedule.location && (
                  <div style={{ padding: '14px 18px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <MapPin size={15} style={{ color: '#888', flexShrink: 0 }} />
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>{schedule.location}</span>
                  </div>
                )}
                <div
                  ref={mapContainerRef}
                  style={{ width: '100%', height: 460, backgroundColor: '#e8e8e8' }}
                />
              </div>
            </div>
          )}

        </div>
      </main>
      <Footer />
    </div>
  );
}
