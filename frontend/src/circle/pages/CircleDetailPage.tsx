import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { Users, Clock, MapPin } from "lucide-react";
import Navbar from "../../common/layout/Navbar";
import Footer from "../../common/layout/Footer";
import CircleDetailTabs from "../../common/components/CircleDetailTabs";
import { circleApi } from "../../api/circleApi";
import { useDirectChat } from "../../chat/hooks/useDirectChat";
import { scheduleApi } from "../../api/scheduleApi";
import { getErrorMessage } from "../../common/utils/errorMessage";
import type { CircleResponse, CircleMember } from "../types/circle";
import type { ScheduleResponse, ScheduleReview } from "../../schedule/types/schedule";
import AdminConfirmModal from "../../admin/component/AdminConfirmModal";
import ReportButton from "../../common/components/ReportButton";

const STATUS_LABEL: Record<
  string,
  { text: string; color: string; bg: string }
> = {
  OPEN: { text: "모집중", color: "#16a34a", bg: "#dcfce7" },
  FULL: { text: "정원마감", color: "#dc2626", bg: "#fee2e2" },
  PENDING: { text: "승인대기", color: "#d97706", bg: "#fef3c7" },
  REJECTED: { text: "거절됨", color: "#6b7280", bg: "#f3f4f6" },
};

const SCHEDULE_STATUS_LABEL: Record<
  string,
  { text: string; color: string; bg: string }
> = {
  UPCOMING: { text: "모집중", color: "#2563eb", bg: "#dbeafe" },
  IN_PROGRESS: { text: "진행중", color: "#16a34a", bg: "#dcfce7" },
  COMPLETED: { text: "종료", color: "#6b7280", bg: "#f3f4f6" },
};

function formatMonthDay(dt: string) {
  const d = new Date(dt);
  return { month: d.getMonth() + 1 + "월", day: d.getDate() };
}

function formatTime(dt: string) {
  return new Date(dt).toLocaleString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export default function CircleDetailPage() {
  const { circleId } = useParams<{ circleId: string }>();
  const cid = Number(circleId);
  const navigate = useNavigate();

  if (!circleId || isNaN(cid)) {
    navigate("/circle", { replace: true });
    return null;
  }

  const { user, isLoggedIn } = useAuthStore();

  const [circle, setCircle] = useState<CircleResponse | null>(null);
  const [activeMembers, setActiveMembers] = useState<CircleMember[]>([]);
  const [myMember, setMyMember] = useState<CircleMember | null>(null);
  const [allSchedules, setAllSchedules] = useState<ScheduleResponse[]>([]);
  const [scheduleTab, setScheduleTab] = useState<'upcoming' | 'past'>('upcoming');
  const [circleReviews, setCircleReviews] = useState<ScheduleReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean; title: string; message: string;
    confirmLabel?: string; confirmColor?: 'green' | 'red'; onConfirm: () => void;
  }>({ open: false, title: '', message: '', onConfirm: () => {} });

  const openConfirm = (title: string, message: string, onConfirm: () => void, confirmColor: 'green' | 'red' = 'red', confirmLabel = '확인') =>
    setConfirmModal({ open: true, title, message, confirmLabel, confirmColor, onConfirm });

  const [msg, setMsg] = useState("");
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [likeLoading, setLikeLoading] = useState(false);
  const [profileModal, setProfileModal] = useState<CircleMember | null>(null);
  const [kakaoReady, setKakaoReady] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [circleRes, activeMembersRes] = await Promise.all([
        circleApi.getCircle(cid),
        circleApi.getActiveMembers(cid, { size: 100 }),
      ]);
      setCircle(circleRes.data);
      const actives = activeMembersRes.data.dtoList;
      setActiveMembers(actives);

      if (user) {
        const me = actives.find((m) => m.nickname === user.nickname) ?? null;
        setMyMember(me);

        if (me) {
          try {
            const [schedRes, reviewsRes] = await Promise.allSettled([
              scheduleApi.getSchedules(cid),
              scheduleApi.getCircleReviews(cid, { size: 4 }),
            ]);
            if (schedRes.status === 'fulfilled') setAllSchedules(schedRes.value.data);
            if (reviewsRes.status === 'fulfilled') setCircleReviews(reviewsRes.value.data);
          } catch {
            // 로드 실패 무시
          }
        }
      }
    } finally {
      setLoading(false);
    }
  }, [cid, user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!isLoggedIn) return;
    circleApi.getCircleLikeStatus(cid)
      .then(res => {
        setLiked(res.data.liked);
        setLikeCount(res.data.likeCount);
      })
      .catch(() => {});
  }, [cid, isLoggedIn]);

  // Kakao Maps SDK 대기
  useEffect(() => {
    const timer = setInterval(() => {
      if (typeof kakao !== "undefined" && (kakao as any).maps) {
        clearInterval(timer);
        (kakao as any).maps.load(() => setKakaoReady(true));
      }
    }, 100);
    return () => clearInterval(timer);
  }, []);

  // 탭별 표시 일정
  const upcomingSchedules = allSchedules.filter((s) => s.status !== "COMPLETED");
  const pastSchedules = allSchedules.filter((s) => s.status === "COMPLETED");
  const displayedSchedules = (scheduleTab === 'upcoming' ? upcomingSchedules : pastSchedules).slice(0, 6);

  // 일정 변경 시 지도 초기화
  useEffect(() => {
    mapRef.current = null;
  }, [allSchedules]);

  // 가장 가까운 위치 정보가 있는 예정 일정 (지도용)
  const nearestScheduleWithLocation =
    upcomingSchedules.find((s) => s.latitude && s.longitude) ??
    upcomingSchedules.find((s) => s.location) ??
    null;

  // 카카오맵 초기화
  useEffect(() => {
    if (!kakaoReady || !nearestScheduleWithLocation || !mapContainerRef.current)
      return;
    if (mapRef.current) return;

    const initMap = (lat: number, lng: number) => {
      if (!mapContainerRef.current) return;
      const maps = (kakao as any).maps;
      const position = new maps.LatLng(lat, lng);
      const map = new maps.Map(mapContainerRef.current, {
        center: position,
        level: 4,
        draggable: false,
        scrollwheel: false,
        disableDoubleClick: true,
        disableDoubleClickZoom: true,
      });
      mapRef.current = map;
      const marker = new maps.Marker({ map, position });
      if (nearestScheduleWithLocation.location) {
        const infowindow = new maps.InfoWindow({
          content: `<div style="padding:8px 12px;font-size:13px;font-weight:600;white-space:nowrap;max-width:220px;overflow:hidden;text-overflow:ellipsis;">${nearestScheduleWithLocation.location}</div>`,
        });
        infowindow.open(map, marker);
      }
    };

    if (
      nearestScheduleWithLocation.latitude &&
      nearestScheduleWithLocation.longitude
    ) {
      initMap(
        nearestScheduleWithLocation.latitude,
        nearestScheduleWithLocation.longitude,
      );
    } else if (nearestScheduleWithLocation.location) {
      const geocoder = new (kakao as any).maps.services.Geocoder();
      geocoder.addressSearch(
        nearestScheduleWithLocation.location,
        (result: any[], status: string) => {
          if (status === (kakao as any).maps.services.Status.OK) {
            initMap(parseFloat(result[0].y), parseFloat(result[0].x));
          }
        },
      );
    }
  }, [kakaoReady, nearestScheduleWithLocation]);

  const action = async (fn: () => Promise<unknown>, successMsg: string) => {
    try {
      await fn();
      setMsg(successMsg);
      await loadData();
    } catch (e) {
      setMsg(`오류: ${getErrorMessage(e)}`);
    }
  };

  const handleJoin = () =>
    action(
      () => circleApi.joinCircle(cid),
      "가입 신청이 완료됐습니다. 리더의 승인을 기다려주세요.",
    );
  const handleLeave = () =>
    openConfirm('서클 탈퇴', '서클에서 탈퇴하시겠습니까?', () =>
      action(() => circleApi.leaveCircle(cid), '탈퇴했습니다.')
    );
  const handleLike = async () => {
    if (!isLoggedIn || likeLoading) return;
    setLikeLoading(true);
    try {
      const res = await circleApi.toggleCircleLike(cid);
      setLiked(res.data.liked);
      setLikeCount(res.data.likeCount);
    } finally {
      setLikeLoading(false);
    }
  };

  const { startDirectChat, directChatError, clearDirectChatError } = useDirectChat();

  if (loading)
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#f7f7f8" }}>
        <Navbar />
        <p style={{ textAlign: "center", padding: "80px 0", color: "#888" }}>
          로딩 중...
        </p>
        <Footer />
      </div>
    );

  if (!circle)
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#f7f7f8" }}>
        <Navbar />
        <p style={{ textAlign: "center", padding: "80px 0", color: "#dc2626" }}>
          서클을 찾을 수 없습니다.
        </p>
        <Footer />
      </div>
    );

  const statusInfo = STATUS_LABEL[circle.status] ?? {
    text: circle.status,
    color: "#888",
    bg: "#f3f4f6",
  };
  const isLeader = myMember?.role === "LEADER";
  const isSubLeader = myMember?.role === "SUB_LEADER";
  const isMember = !!myMember;

  const AVATAR_COLORS = [
    "#F4A261",
    "#E76F51",
    "#2A9D8F",
    "#457B9D",
    "#6D6875",
    "#E9C46A",
    "#264653",
  ];
  const nickColor = (nick: string) =>
    AVATAR_COLORS[(nick?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length];

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f7f7f8" }}>
      {/* 카카오 스타일 프로필 모달 */}
      {profileModal && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}
          onClick={() => { setProfileModal(null); clearDirectChatError(); }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              width: 300,
              overflow: "hidden",
              boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                background: nickColor(profileModal.nickname),
                height: 100,
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: "50%",
                  background: nickColor(profileModal.nickname),
                  border: "4px solid #fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 28,
                  fontWeight: 700,
                  color: "#fff",
                  marginBottom: -36,
                }}
              >
                {profileModal.nickname.charAt(0)}
              </div>
            </div>
            <div
              style={{ paddingTop: 44, paddingBottom: 24, textAlign: "center" }}
            >
              <div style={{ fontWeight: 700, fontSize: 18, color: "#111" }}>
                {profileModal.nickname}
              </div>
              {profileModal.role === "LEADER" && (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#d97706",
                    backgroundColor: "#fef3c7",
                    padding: "2px 8px",
                    borderRadius: 4,
                    marginTop: 6,
                    display: "inline-block",
                  }}
                >
                  리더
                </span>
              )}
              {profileModal.role === "SUB_LEADER" && (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#4E7C69",
                    backgroundColor: "#EAF4F0",
                    padding: "2px 8px",
                    borderRadius: 4,
                    marginTop: 6,
                    display: "inline-block",
                  }}
                >
                  부리더
                </span>
              )}
            </div>
            {directChatError && (
              <div style={{ margin: '0 24px 12px', padding: '10px 14px', background: '#fff3f3', border: '1px solid #f5c6c6', borderRadius: 8, fontSize: 13, color: '#c62828', textAlign: 'center' }}>
                {directChatError}
              </div>
            )}
            <div style={{ borderTop: "1px solid #f0f0f0", padding: "14px 24px" }}>
              <button
                style={{ width: '100%', padding: '12px 0', background: '#111', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}
                onClick={() => startDirectChat(profileModal.userId)}
              >
                💬 1:1 채팅하기
              </button>
            </div>
          </div>
        </div>
      )}

      <Navbar />
      <main
        style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 20px 60px" }}
      >
        {msg && (
          <div
            style={{
              marginBottom: 16,
              padding: "10px 14px",
              borderRadius: 8,
              fontSize: 13,
              backgroundColor: msg.startsWith("오류") ? "#fef2f2" : "#f0fdf4",
              color: msg.startsWith("오류") ? "#dc2626" : "#16a34a",
            }}
          >
            {msg}
          </div>
        )}

        {/* 서클 헤더 카드 */}
        <div
          style={{
            backgroundColor: "white",
            borderRadius: 16,
            overflow: "hidden",
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            marginBottom: 20,
          }}
        >
          {circle.coverImageUrl && (
            <img
              src={circle.coverImageUrl}
              alt={circle.name}
              style={{
                width: "100%",
                aspectRatio: "16/9",
                maxHeight: 340,
                objectFit: "cover",
                display: "block",
              }}
            />
          )}
          <div style={{ padding: 28 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 8,
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      padding: "3px 10px",
                      borderRadius: 999,
                      backgroundColor: "#f3f4f6",
                      color: "#555",
                    }}
                  >
                    {circle.categoryName}
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      padding: "3px 10px",
                      borderRadius: 999,
                      backgroundColor: statusInfo.bg,
                      color: statusInfo.color,
                    }}
                  >
                    {statusInfo.text}
                  </span>
                </div>
                <h1
                  style={{
                    fontSize: 24,
                    fontWeight: 800,
                    color: "#111",
                    marginBottom: 8,
                  }}
                >
                  {circle.name}
                </h1>
                <p style={{ fontSize: 14, color: "#555", lineHeight: 1.6 }}>
                  {circle.description || "소개글이 없습니다."}
                </p>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 15,
                    color: "#333",
                    justifyContent: "flex-end",
                  }}
                >
                  <Users size={16} />
                  <strong>{circle.currentMember}</strong>
                  <span style={{ color: "#aaa" }}>/ {circle.maxMember}명</span>
                </div>
              </div>
            </div>

            {/* 액션 버튼 */}
            <div
              style={{
                marginTop: 20,
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              {/* 좋아요 버튼 */}
              {isLoggedIn && (
                <button
                  onClick={handleLike}
                  disabled={likeLoading}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "9px 16px", borderRadius: 8, cursor: likeLoading ? "default" : "pointer",
                    border: `1px solid ${liked ? "#e3886d" : "#e5e5e5"}`,
                    backgroundColor: liked ? "#fdf1ec" : "white",
                    color: liked ? "#e3886d" : "#888",
                    fontSize: 13, fontWeight: 600,
                    transition: "all 0.15s",
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill={liked ? "#e3886d" : "none"} stroke={liked ? "#e3886d" : "#aaa"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                  {likeCount > 0 && <span>{likeCount}</span>}
                </button>
              )}
              {(isLeader || isSubLeader) && (
                <button
                  onClick={() => navigate(`/circle/${cid}/manage`)}
                  style={outlineBtnStyle}
                >
                  서클 관리
                </button>
              )}
              {isMember && !isLeader && (
                <button
                  onClick={handleLeave}
                  style={{
                    ...outlineBtnStyle,
                    color: "#dc2626",
                    borderColor: "#fca5a5",
                  }}
                >
                  탈퇴
                </button>
              )}
              {isLoggedIn && !isMember && circle.status === "OPEN" && (
                <button
                  onClick={handleJoin}
                  style={{
                    padding: "9px 20px",
                    borderRadius: 8,
                    backgroundColor: "#111",
                    color: "white",
                    fontSize: 13,
                    fontWeight: 600,
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  가입 신청
                </button>
              )}
              {!isLoggedIn && circle.status === "OPEN" && (
                <button
                  onClick={() => navigate("/users/login")}
                  style={{
                    padding: "9px 20px",
                    borderRadius: 8,
                    backgroundColor: "#111",
                    color: "white",
                    fontSize: 13,
                    fontWeight: 600,
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  로그인 후 가입 신청
                </button>
              )}
              {isLoggedIn && !isLeader && (
                <ReportButton targetType="CIRCLE" targetId={cid} />
              )}
            </div>
          </div>
        </div>

        <CircleDetailTabs circleId={cid} activeTab="home" />

        {/* 2컬럼 레이아웃 */}
        <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
          {/* 왼쪽: 다가오는 일정 */}
          <div
            style={{
              flex: 1,
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            {/* 다가오는 일정 */}
            <div
              style={{
                backgroundColor: "white",
                borderRadius: 16,
                padding: 24,
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h2 style={sectionTitleStyle}>일정</h2>
                {isMember && (
                  <div style={{ display: 'flex', gap: 4, backgroundColor: '#f3f4f6', borderRadius: 8, padding: 3 }}>
                    {(['upcoming', 'past'] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setScheduleTab(tab)}
                        style={{
                          padding: '4px 12px', borderRadius: 6, border: 'none', cursor: 'pointer',
                          fontSize: 12, fontWeight: 600,
                          backgroundColor: scheduleTab === tab ? 'white' : 'transparent',
                          color: scheduleTab === tab ? '#111' : '#888',
                          boxShadow: scheduleTab === tab ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                          transition: 'all 0.15s',
                        }}
                      >
                        {tab === 'upcoming' ? '예정' : '지나간 일정'}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {!isMember ? (
                /* 비멤버 티저 카드 */
                <>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 10,
                    }}
                  >
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div
                        key={i}
                        style={{
                          border: "1px solid #f0f0f0",
                          borderRadius: 12,
                          padding: "14px 16px",
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 12,
                          opacity: 0.6,
                          backgroundColor: "white",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            minWidth: 32,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 11,
                              color: "#ccc",
                              fontWeight: 500,
                            }}
                          >
                            --월
                          </span>
                          <span
                            style={{
                              fontSize: 20,
                              fontWeight: 800,
                              color: "#d1d5db",
                              lineHeight: 1.1,
                            }}
                          >
                            --
                          </span>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <span
                            style={{
                              fontSize: 13,
                              color: "#ccc",
                              display: "block",
                              marginBottom: 6,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            모임에만 공개된 일정이에요.
                          </span>
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 3,
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                                fontSize: 12,
                                color: "#ddd",
                              }}
                            >
                              <Clock size={12} />
                              <span>--:--</span>
                            </div>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                                fontSize: 12,
                                color: "#ddd",
                              }}
                            >
                              <Users size={12} />
                              <span>-/--명</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p
                    style={{
                      fontSize: 12,
                      color: "#bbb",
                      textAlign: "center",
                      marginTop: 8,
                    }}
                  >
                    가입하면 일정을 확인할 수 있어요.
                  </p>
                </>
              ) : displayedSchedules.length === 0 ? (
                <div style={{ textAlign: "center", padding: "32px 0", color: "#bbb" }}>
                  <p style={{ fontSize: 14, marginBottom: 8 }}>
                    {scheduleTab === 'upcoming' ? '예정된 일정이 없습니다.' : '완료된 일정이 없습니다.'}
                  </p>
                  {scheduleTab === 'upcoming' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                      <Link
                        to={`/circle/${cid}/schedules/create`}
                        style={{ fontSize: 13, color: "#5F8F7B", fontWeight: 600, textDecoration: "none" }}
                      >
                        + 일정 만들기
                      </Link>
                    </div>
                  ) : null}
                </div>
              ) : (
                <>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 10,
                    }}
                  >
                    {displayedSchedules.map((s) => {
                      const { month, day } = formatMonthDay(s.startAt);
                      const scheduleStatus = SCHEDULE_STATUS_LABEL[
                        s.status
                      ] ?? { text: s.status, color: "#888", bg: "#f3f4f6" };
                      return (
                        <div
                          key={s.scheduleId}
                          onClick={() =>
                            navigate(`/circle/${cid}/schedules/${s.scheduleId}`)
                          }
                          style={{
                            border: "1px solid #f0f0f0",
                            borderRadius: 12,
                            padding: "14px 16px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 12,
                            backgroundColor: "#fff",
                            transition: "box-shadow 0.15s",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.boxShadow =
                              "0 4px 16px rgba(0,0,0,0.1)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.boxShadow = "none")
                          }
                        >
                          {/* 날짜 */}
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              minWidth: 32,
                              flexShrink: 0,
                            }}
                          >
                            <span
                              style={{
                                fontSize: 11,
                                color: "#888",
                                fontWeight: 500,
                              }}
                            >
                              {month}
                            </span>
                            <span
                              style={{
                                fontSize: 20,
                                fontWeight: 800,
                                color: "#111",
                                lineHeight: 1.1,
                              }}
                            >
                              {day}
                            </span>
                          </div>
                          {/* 내용 */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <span
                              style={{
                                fontSize: 13,
                                fontWeight: 600,
                                color: "#333",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                display: "block",
                                marginBottom: 4,
                              }}
                            >
                              {s.title}
                            </span>
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 700,
                                color: scheduleStatus.color,
                                display: "block",
                                marginBottom: 6,
                              }}
                            >
                              {scheduleStatus.text}
                            </span>
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 3,
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 4,
                                  fontSize: 12,
                                  color: "#888",
                                }}
                              >
                                <Clock size={12} />
                                <span>{formatTime(s.startAt)}</span>
                              </div>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 4,
                                  fontSize: 12,
                                  color: "#888",
                                }}
                              >
                                <Users size={12} />
                                <span>
                                  {s.currentMember !== undefined
                                    ? `${s.currentMember}/`
                                    : ""}
                                  {s.maxMember}명
                                </span>
                              </div>
                            </div>
                            {s.tags && s.tags.length > 0 && (
                              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 8 }}>
                                {s.tags.map(tag => (
                                  <span key={tag.id} style={{
                                    fontSize: 10, fontWeight: 600,
                                    padding: "2px 7px", borderRadius: 999,
                                    backgroundColor: "#eef2ff", color: "#6366f1",
                                  }}>
                                    {tag.name}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <Link
                    to={`/circle/${cid}/schedules`}
                    style={{
                      display: "block",
                      textAlign: "center",
                      padding: "10px",
                      borderRadius: 8,
                      border: "1px solid #e5e5e5",
                      backgroundColor: "#f5f5f5",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#111",
                      textDecoration: "none",
                      marginTop: 8,
                    }}
                  >
                    전체 일정 보기
                    {scheduleTab === 'past' && pastSchedules.length > 6 && (
                      <span style={{ fontWeight: 400, color: '#888', marginLeft: 4 }}>
                        ({pastSchedules.length}개)
                      </span>
                    )}
                  </Link>
                </>
              )}

              {/* 최근 일정 후기 */}
              {isMember && circleReviews.length > 0 && (
                <>
                  <div style={{ borderTop: "1px solid #f0f0f0", margin: "16px 0 14px" }} />
                  <div style={{ marginBottom: 16, display: "flex", alignItems: "center" }}>
                    <h2 style={sectionTitleStyle}>최근 일정 후기</h2>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {circleReviews.map((r) => {
                      const imgMatch = r.content.match(/<img[^>]*\bsrc\s*=\s*['"]([^'"]+)['"]/i);
                      const thumbSrc = imgMatch ? imgMatch[1] : null;
                      const plainText = r.content.replace(/<[^>]+>/g, "").trim();
                      return (
                        <div
                          key={r.reviewId}
                          onClick={() => navigate(`/circle/${cid}/reviews`)}
                          style={{
                            border: "1px solid #f0f0f0",
                            borderRadius: 10,
                            padding: "10px 11px",
                            cursor: "pointer",
                            backgroundColor: "#fafafa",
                            transition: "box-shadow 0.15s",
                            display: "flex",
                            flexDirection: "column",
                            gap: 5,
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)")}
                          onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
                        >
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 4 }}>
                            <span style={{ fontSize: 10, fontWeight: 600, color: "#5F8F7B", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {r.scheduleTitle}
                            </span>
                            <span style={{ fontSize: 10, color: "#f59e0b", letterSpacing: 0.5, flexShrink: 0 }}>
                              {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                            </span>
                          </div>
                          <div style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
                            <p style={{ fontSize: 11, color: "#555", margin: 0, lineHeight: 1.5, flex: 1, minWidth: 0, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                              {plainText || "（이미지 후기）"}
                            </p>
                            {thumbSrc && (
                              <img
                                src={thumbSrc}
                                alt=""
                                style={{ width: 36, height: 36, borderRadius: 6, objectFit: "cover", flexShrink: 0 }}
                              />
                            )}
                          </div>
                          <div style={{ fontSize: 10, color: "#bbb" }}>
                            {r.nickname} · {new Date(r.createdAt).toLocaleDateString("ko-KR")}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <Link
                    to={`/circle/${cid}/reviews`}
                    style={{
                      display: "block",
                      textAlign: "center",
                      padding: "10px",
                      borderRadius: 8,
                      border: "1px solid #e5e5e5",
                      backgroundColor: "#f5f5f5",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#111",
                      textDecoration: "none",
                      marginTop: 8,
                    }}
                  >
                    전체 후기 보기
                  </Link>
                </>
              )}
            </div>

          </div>

          {/* 오른쪽: 멤버 사이드바 + 지도 */}
          <div
            style={{
              width: 280,
              flexShrink: 0,
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            {/* 멤버 카드 */}
            <div
              style={{
                backgroundColor: "white",
                borderRadius: 16,
                padding: 24,
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              }}
            >
              <div style={{ marginBottom: 16 }}>
                <h2 style={sectionTitleStyle}>
                  멤버 ({activeMembers.length}명)
                </h2>
              </div>

              {activeMembers.length === 0 ? (
                <p
                  style={{
                    fontSize: 13,
                    color: "#aaa",
                    textAlign: "center",
                    padding: "16px 0",
                  }}
                >
                  멤버가 없습니다.
                </p>
              ) : (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 0 }}
                >
                  {activeMembers.slice(0, 5).map((m) => (
                    <div
                      key={m.circleMemberId}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "10px 0",
                        borderBottom: "1px solid #f5f5f5",
                      }}
                    >
                      <div
                        onClick={() => {
                          if (m.nickname !== user?.nickname) setProfileModal(m);
                        }}
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: "50%",
                          flexShrink: 0,
                          backgroundColor:
                            m.role === "LEADER" ? "#111" : m.role === "SUB_LEADER" ? "#4E7C69" : "#e5e7eb",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor:
                            m.nickname !== user?.nickname
                              ? "pointer"
                              : "default",
                        }}
                      >
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke={m.role === "LEADER" || m.role === "SUB_LEADER" ? "white" : "#6b7280"}
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="12" cy="8" r="4" />
                          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                        </svg>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: "#111",
                            display: "block",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {m.nickname}
                        </span>
                        {m.nickname === user?.nickname && (
                          <span style={{ fontSize: 11, color: "#aaa" }}>
                            나
                          </span>
                        )}
                      </div>
                      {m.role === "LEADER" && (
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: "#d97706",
                            backgroundColor: "#fef3c7",
                            padding: "2px 6px",
                            borderRadius: 4,
                            flexShrink: 0,
                          }}
                        >
                          리더
                        </span>
                      )}
                      {m.role === "SUB_LEADER" && (
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: "#4E7C69",
                            backgroundColor: "#EAF4F0",
                            padding: "2px 6px",
                            borderRadius: 4,
                            flexShrink: 0,
                          }}
                        >
                          부리더
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <Link
                to={`/circle/${cid}/members`}
                style={{
                  display: "block",
                  textAlign: "center",
                  padding: "10px",
                  borderRadius: 8,
                  border: "1px solid #e5e5e5",
                  backgroundColor: "#f5f5f5",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#111",
                  textDecoration: "none",
                  marginTop: 16,
                }}
              >
                전체 멤버 보기
              </Link>
            </div>

            {/* 가장 가까운 일정 위치 지도 */}
            {isMember && (
              <div
                style={{
                  backgroundColor: "white",
                  borderRadius: 16,
                  padding: 20,
                  boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                }}
              >
                <h2 style={{ ...sectionTitleStyle, marginBottom: 12 }}>
                  다음 일정 장소
                </h2>
                {nearestScheduleWithLocation ? (
                  <>
                    <div style={{ marginBottom: 10 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: "#111", margin: "0 0 4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {nearestScheduleWithLocation.title}
                      </p>
                      <p style={{ fontSize: 11, color: "#888", margin: 0 }}>
                        {new Date(nearestScheduleWithLocation.startAt).toLocaleString("ko-KR", { month: "long", day: "numeric", weekday: "short", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    {nearestScheduleWithLocation.location && (
                      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 10, fontSize: 12, color: "#555" }}>
                        <MapPin size={13} color="#888" />
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {nearestScheduleWithLocation.location}
                        </span>
                      </div>
                    )}
                    <div
                      ref={mapContainerRef}
                      style={{
                        width: "100%",
                        height: 200,
                        borderRadius: 10,
                        backgroundColor: "#f3f4f6",
                        overflow: "hidden",
                      }}
                    />
                  </>
                ) : (
                  <p
                    style={{
                      fontSize: 13,
                      color: "#bbb",
                      textAlign: "center",
                      padding: "24px 0",
                    }}
                  >
                    위치 정보가 있는 일정이 없어요.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
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

const sectionTitleStyle: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 700,
  color: "#111",
  marginBottom: 16,
};
const outlineBtnStyle: React.CSSProperties = {
  padding: "9px 16px",
  borderRadius: 8,
  border: "1px solid #e5e5e5",
  background: "white",
  color: "#333",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
};
