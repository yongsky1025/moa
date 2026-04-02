import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Users, MapPin, Star, Trash2, Building2, ChevronRight, UserCheck, UserX } from 'lucide-react';
import DOMPurify from 'dompurify';
import Navbar from '../../common/layout/Navbar';
import Footer from '../../common/layout/Footer';
import { scheduleApi } from '../../api/scheduleApi';
import { getErrorMessage } from '../../common/utils/errorMessage';
import { useAuthStore } from '../../store/authStore';
import type { ScheduleResponse, ScheduleMember, ScheduleReview, ReservationStatus } from '../types/schedule';
import ScheduleReviewCkEditor from '../components/ScheduleReviewCkEditor';
import AdminConfirmModal from '../../admin/component/AdminConfirmModal';

const STATUS_LABEL = {
  UPCOMING:    { text: '예정',   color: '#2563eb', bg: '#dbeafe' },
  IN_PROGRESS: { text: '진행중', color: '#16a34a', bg: '#dcfce7' },
  COMPLETED:   { text: '완료',   color: '#6b7280', bg: '#f3f4f6' },
};

const RESERVATION_STATUS_LABEL: Record<ReservationStatus, { text: string; color: string; bg: string }> = {
  HOLDING:   { text: '결제 대기', color: '#d97706', bg: '#fef3c7' },
  RESERVED:  { text: '예약 완료', color: '#16a34a', bg: '#dcfce7' },
  COMPLETED: { text: '이용 완료', color: '#6b7280', bg: '#f3f4f6' },
  CANCELLED: { text: '취소됨',   color: '#dc2626', bg: '#fef2f2' },
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

  const [members, setMembers] = useState<ScheduleMember[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [pendingMembers, setPendingMembers] = useState<ScheduleMember[]>([]);

  const currentUser = useAuthStore(s => s.user);
  const [reviews, setReviews] = useState<ScheduleReview[]>([]);
  const [reviewContent, setReviewContent] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewMsg, setReviewMsg] = useState('');
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean; title: string; message: string;
    confirmLabel?: string; confirmColor?: 'green' | 'red'; onConfirm: () => void;
  }>({ open: false, title: '', message: '', onConfirm: () => {} });

  const openConfirm = (title: string, message: string, onConfirm: () => void, confirmColor: 'green' | 'red' = 'red', confirmLabel = '확인') =>
    setConfirmModal({ open: true, title, message, confirmLabel, confirmColor, onConfirm });

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  const fetchMembers = () => {
    setMembersLoading(true);
    scheduleApi.getScheduleMembers(cid, sid)
      .then(res => setMembers(res.data))
      .catch(() => {})
      .finally(() => setMembersLoading(false));
  };

  const fetchPendingMembers = () => {
    scheduleApi.getPendingMembers(cid, sid)
      .then(res => setPendingMembers(res.data))
      .catch(() => {});
  };

  const fetchReviews = () => {
    scheduleApi.getReviews(cid, sid)
      .then(res => setReviews(res.data))
      .catch(() => {});
  };

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
      .then(res => {
        setSchedule(res.data);
        if (res.data.isCreator) fetchPendingMembers();
      })
      .catch(e => setMsg(`오류: ${getErrorMessage(e)}`))
      .finally(() => setLoading(false));

    fetchMembers();
    fetchReviews();
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
      scheduleApi.getSchedule(cid, sid).then(res => {
        setSchedule(res.data);
        if (res.data.isCreator) fetchPendingMembers();
      });
      fetchMembers();
    } catch (e) {
      setMsg(`오류: ${getErrorMessage(e)}`);
    }
  };

  const handleJoin = () =>
    openConfirm(
      '일정 참여',
      '이 일정에 참여하시겠습니까?',
      async () => {
        try {
          const res = await scheduleApi.joinSchedule(cid, sid);
          if (res.data.result === 'PENDING') {
            setMsg('참여 신청이 완료됐습니다. 일정 생성자의 승인 후 참여됩니다.');
          } else {
            setMsg('일정에 참여했습니다.');
          }
          scheduleApi.getSchedule(cid, sid).then(r => setSchedule(r.data));
          fetchMembers();
        } catch (e) {
          setMsg(`오류: ${getErrorMessage(e)}`);
        }
      },
      'green',
      '참여하기'
    );

  const handleCancel = () =>
    openConfirm('참여 취소', '일정 참여를 취소하시겠습니까?', () =>
      action(() => scheduleApi.cancelSchedule(cid, sid), '참여를 취소했습니다.')
    );

  const handleDelete = () =>
    openConfirm('일정 삭제', '일정을 삭제하시겠습니까? 복구할 수 없습니다.', () =>
      action(async () => {
        await scheduleApi.deleteSchedule(cid, sid);
        navigate(`/circle/${cid}/schedules`);
      }, '삭제됐습니다.')
    );

  const handleReviewSubmit = async () => {
    if (!reviewContent.trim()) {
      setReviewMsg('후기 내용을 입력해주세요.');
      return;
    }
    setReviewSubmitting(true);
    setReviewMsg('');
    try {
      await scheduleApi.createReview(cid, sid, { content: reviewContent, rating: reviewRating });
      setReviewContent('');
      setReviewRating(5);
      fetchReviews();
      setReviewMsg('후기가 등록되었습니다.');
    } catch (e) {
      setReviewMsg(`오류: ${getErrorMessage(e)}`);
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleApprove = (scheduleMemberId: number, nickname: string) =>
    openConfirm(
      '참여 승인',
      `${nickname}님의 참여를 승인하시겠습니까?`,
      async () => {
        try {
          await scheduleApi.approveMember(cid, sid, scheduleMemberId);
          setMsg(`${nickname}님의 참여가 승인됐습니다.`);
          scheduleApi.getSchedule(cid, sid).then(r => setSchedule(r.data));
          fetchMembers();
          fetchPendingMembers();
        } catch (e) {
          setMsg(`오류: ${getErrorMessage(e)}`);
        }
      },
      'green',
      '승인'
    );

  const handleReject = (scheduleMemberId: number, nickname: string) =>
    openConfirm(
      '참여 거절',
      `${nickname}님의 참여를 거절하시겠습니까?`,
      async () => {
        try {
          await scheduleApi.rejectMember(cid, sid, scheduleMemberId);
          setMsg(`${nickname}님의 참여 신청을 거절했습니다.`);
          fetchPendingMembers();
          scheduleApi.getSchedule(cid, sid).then(r => setSchedule(r.data));
        } catch (e) {
          setMsg(`오류: ${getErrorMessage(e)}`);
        }
      },
      'red',
      '거절'
    );

  const handleReviewDelete = (reviewId: number) =>
    openConfirm('후기 삭제', '후기를 삭제하시겠습니까?', async () => {
      try {
        await scheduleApi.deleteReview(cid, sid, reviewId);
        fetchReviews();
      } catch (e) {
        setReviewMsg(`오류: ${getErrorMessage(e)}`);
      }
    });

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

        <div style={{ display: 'flex', gap: 20, alignItems: 'stretch' }}>

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

            <p style={{ fontSize: 14, color: '#555', lineHeight: 1.7, marginBottom: schedule.tags && schedule.tags.length > 0 ? 12 : 24, whiteSpace: 'pre-wrap' }}>
              {schedule.description}
            </p>

            {schedule.tags && schedule.tags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 24 }}>
                {schedule.tags.map(tag => (
                  <span key={tag.id} style={{
                    padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                    backgroundColor: '#eef2ff', color: '#6366f1', border: '1px solid #c7d2fe',
                  }}>
                    {tag.name}
                  </span>
                ))}
              </div>
            )}

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
              {isUpcoming && !schedule.joined && !schedule.isPending && !schedule.isCreator && (
                <button
                  onClick={handleJoin}
                  style={{ padding: '10px 20px', borderRadius: 8, border: 'none', backgroundColor: '#111', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                >
                  참여하기
                </button>
              )}
              {isUpcoming && schedule.isPending && (
                <span style={{
                  padding: '10px 16px', borderRadius: 8, border: '1px solid #fde68a',
                  backgroundColor: '#fef9c3', color: '#92400e', fontSize: 13, fontWeight: 600,
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <Clock size={14} />
                  승인 대기 중
                </span>
              )}
              {isUpcoming && (schedule.joined || schedule.isPending) && !schedule.isCreator && (
                <button
                  onClick={handleCancel}
                  style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid #fca5a5', backgroundColor: 'white', color: '#dc2626', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                >
                  {schedule.isPending ? '신청 취소' : '참여 취소'}
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
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
              <div style={{ backgroundColor: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', flex: 1 }}>
                {schedule.location && (
                  <div style={{ padding: '14px 18px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <MapPin size={15} style={{ color: '#888', flexShrink: 0 }} />
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>{schedule.location}</span>
                  </div>
                )}
                <div
                  ref={mapContainerRef}
                  style={{ width: '100%', flex: 1, minHeight: 300, backgroundColor: '#e8e8e8' }}
                />
              </div>
            </div>
          )}

        </div>

        {/* 예약 장소 카드 */}
        {schedule.reservation && (
          <div style={{ marginTop: 20, backgroundColor: 'white', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Building2 size={16} style={{ color: '#888' }} />
              <span style={{ fontSize: 15, fontWeight: 700, color: '#111' }}>예약 장소</span>
            </div>
            <button
              onClick={() => navigate('/place/my-reservations')}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                width: '100%', padding: '14px 16px', borderRadius: 12,
                border: '1px solid #e5e7eb', backgroundColor: '#f9fafb',
                cursor: 'pointer', textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: '#111' }}>
                    {schedule.reservation.placeName}
                  </span>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 999,
                    backgroundColor: RESERVATION_STATUS_LABEL[schedule.reservation.status].bg,
                    color: RESERVATION_STATUS_LABEL[schedule.reservation.status].color,
                  }}>
                    {RESERVATION_STATUS_LABEL[schedule.reservation.status].text}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#666' }}>
                  <MapPin size={13} style={{ color: '#aaa', flexShrink: 0 }} />
                  <span>{schedule.reservation.placeAddress}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#666' }}>
                  <Clock size={13} style={{ color: '#aaa', flexShrink: 0 }} />
                  <span>
                    {new Date(schedule.reservation.startTime).toLocaleString('ko-KR', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    {' ~ '}
                    {new Date(schedule.reservation.endTime).toLocaleString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div style={{ fontSize: 13, color: '#5F8F7B', fontWeight: 600 }}>
                  {schedule.reservation.totalPrice.toLocaleString()}원
                </div>
              </div>
              <ChevronRight size={18} style={{ color: '#aaa', flexShrink: 0 }} />
            </button>
            <p style={{ marginTop: 10, fontSize: 12, color: '#aaa' }}>
              클릭하면 내 예약 페이지로 이동합니다.
            </p>
          </div>
        )}

        {/* 승인 대기 섹션 (생성자/리더만) */}
        {schedule.isCreator && isUpcoming && (
          <div style={{ marginTop: 20, backgroundColor: 'white', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <UserCheck size={16} style={{ color: '#d97706' }} />
              <span style={{ fontSize: 15, fontWeight: 700, color: '#111' }}>참여 승인 대기</span>
              {(schedule.pendingCount ?? 0) > 0 && (
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 999,
                  backgroundColor: '#fef3c7', color: '#92400e',
                }}>
                  {schedule.pendingCount}명
                </span>
              )}
            </div>
            {pendingMembers.length === 0 ? (
              <p style={{ color: '#aaa', fontSize: 13 }}>승인 대기 중인 참여 신청이 없습니다.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {pendingMembers.map(m => (
                  <div key={m.scheduleMemberId} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 14px', borderRadius: 10,
                    backgroundColor: '#fffbeb', border: '1px solid #fde68a',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%', backgroundColor: '#fef3c7',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 13, fontWeight: 700, color: '#92400e', flexShrink: 0,
                      }}>
                        {m.nickname.charAt(0)}
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>{m.nickname}</span>
                      <span style={{ fontSize: 11, color: '#6b7280' }}>재참여 신청</span>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={() => handleApprove(m.scheduleMemberId, m.nickname)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 4,
                          padding: '6px 12px', borderRadius: 6, border: 'none',
                          backgroundColor: '#16a34a', color: 'white',
                          fontSize: 12, fontWeight: 600, cursor: 'pointer',
                        }}
                      >
                        <UserCheck size={13} />
                        승인
                      </button>
                      <button
                        onClick={() => handleReject(m.scheduleMemberId, m.nickname)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 4,
                          padding: '6px 12px', borderRadius: 6,
                          border: '1px solid #fca5a5', backgroundColor: 'white',
                          color: '#dc2626', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                        }}
                      >
                        <UserX size={13} />
                        거절
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 참여자 목록 */}
        <div style={{ marginTop: 20, backgroundColor: 'white', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Users size={16} style={{ color: '#888' }} />
            <span style={{ fontSize: 15, fontWeight: 700, color: '#111' }}>참여자</span>
            <span style={{ fontSize: 13, color: '#888' }}>
              {schedule.currentMember ?? members.length}/{schedule.maxMember}명
            </span>
          </div>
          {membersLoading ? (
            <p style={{ color: '#888', fontSize: 13 }}>로딩 중...</p>
          ) : members.length === 0 ? (
            <p style={{ color: '#aaa', fontSize: 13 }}>참여자가 없습니다.</p>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {members.map(m => (
                <div key={m.userId} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 12px', borderRadius: 10,
                  backgroundColor: '#f9fafb', border: '1px solid #f0f0f0',
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    backgroundColor: m.role === 'LEADER' ? '#fef9c3' : '#f3f4f6',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 700,
                    color: m.role === 'LEADER' ? '#854d0e' : '#555',
                    flexShrink: 0,
                  }}>
                    {m.nickname.charAt(0)}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>{m.nickname}</span>
                    {m.role === 'LEADER' && (
                      <span style={{
                        fontSize: 10, fontWeight: 700, color: '#854d0e',
                        backgroundColor: '#fef9c3', borderRadius: 4, padding: '1px 5px',
                      }}>
                        모임장
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 후기 섹션 (완료된 일정만) */}
        {schedule.status === 'COMPLETED' && (
          <div style={{ marginTop: 20, backgroundColor: 'white', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <Star size={16} style={{ color: '#f59e0b' }} />
              <span style={{ fontSize: 15, fontWeight: 700, color: '#111' }}>후기</span>
              <span style={{ fontSize: 13, color: '#888' }}>{reviews.length}개</span>
            </div>

            {/* 후기 작성 폼 */}
            {schedule.joined && !reviews.find(r => r.nickname === currentUser?.nickname) && (
              <div style={{ marginBottom: 28, padding: 20, backgroundColor: '#f9fafb', borderRadius: 12, border: '1px solid #f0f0f0' }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 12 }}>후기 작성</p>

                {/* 별점 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
                  <span style={{ fontSize: 13, color: '#555', marginRight: 4 }}>별점</span>
                  {[1, 2, 3, 4, 5].map(n => (
                    <button
                      key={n}
                      onClick={() => setReviewRating(n)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, fontSize: 22, color: n <= reviewRating ? '#f59e0b' : '#d1d5db' }}
                    >
                      ★
                    </button>
                  ))}
                  <span style={{ fontSize: 13, color: '#888' }}>{reviewRating}점</span>
                </div>

                {/* CKEditor */}
                <div style={{ marginBottom: 14 }}>
                  <ScheduleReviewCkEditor
                    value={reviewContent}
                    onChange={setReviewContent}
                    onError={setReviewMsg}
                  />
                </div>

                {reviewMsg && (
                  <p style={{ fontSize: 13, color: reviewMsg.startsWith('오류') ? '#dc2626' : '#16a34a', marginBottom: 10 }}>
                    {reviewMsg}
                  </p>
                )}

                <button
                  onClick={handleReviewSubmit}
                  disabled={reviewSubmitting}
                  style={{
                    padding: '9px 20px', borderRadius: 8, border: 'none',
                    backgroundColor: reviewSubmitting ? '#9ca3af' : '#111',
                    color: 'white', fontSize: 13, fontWeight: 600, cursor: reviewSubmitting ? 'not-allowed' : 'pointer',
                  }}
                >
                  {reviewSubmitting ? '등록 중...' : '후기 등록'}
                </button>
              </div>
            )}

            {/* 후기 목록 */}
            {reviews.length === 0 ? (
              <p style={{ color: '#aaa', fontSize: 13 }}>아직 후기가 없습니다.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {reviews.map(review => (
                  <div key={review.reviewId} style={{
                    padding: 18, borderRadius: 12, border: '1px solid #f0f0f0', backgroundColor: '#fafafa',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%', backgroundColor: '#f3f4f6',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 13, fontWeight: 700, color: '#555', flexShrink: 0,
                        }}>
                          {review.nickname.charAt(0)}
                        </div>
                        <div>
                          <span style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>{review.nickname}</span>
                          <div style={{ display: 'flex', gap: 1, marginTop: 2 }}>
                            {[1, 2, 3, 4, 5].map(n => (
                              <span key={n} style={{ fontSize: 13, color: n <= review.rating ? '#f59e0b' : '#d1d5db' }}>★</span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 12, color: '#aaa' }}>
                          {new Date(review.createdAt).toLocaleDateString('ko-KR')}
                        </span>
                        {(review.nickname === currentUser?.nickname) && (
                          <button
                            onClick={() => handleReviewDelete(review.reviewId)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#aaa', display: 'flex', alignItems: 'center' }}
                            title="삭제"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                    <div
                      className="ck-content"
                      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(review.content) }}
                      style={{ fontSize: 14, color: '#444', lineHeight: 1.7 }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>
      <Footer />
      <AdminConfirmModal
        open={confirmModal.open}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmLabel={confirmModal.confirmLabel}
        confirmColor={confirmModal.confirmColor}
        onConfirm={() => { setConfirmModal(m => ({ ...m, open: false })); confirmModal.onConfirm(); }}
        onCancel={() => setConfirmModal(m => ({ ...m, open: false }))}
      />
    </div>
  );
}
