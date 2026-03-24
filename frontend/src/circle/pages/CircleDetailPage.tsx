import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { Users, Clock, MapPin } from "lucide-react";
import Navbar from "../../common/layout/Navbar";
import Footer from "../../common/layout/Footer";
import CircleBoardSideMenu from "../../board/components/CircleBoardSideMenu";
import CircleBoardPostPreviewSection from "../../board/components/CircleBoardPostPreviewSection";
import { circleApi } from "../../api/circleApi";
import { chatApi } from "../../api/chatApi";
import { useDirectChat } from "../../chat/hooks/useDirectChat";
import { scheduleApi } from "../../api/scheduleApi";
import { getErrorMessage } from "../../common/utils/errorMessage";
import type { CircleResponse, CircleMember } from "../types/circle";
import type { ScheduleResponse } from "../../schedule/types/schedule";
import type { RootState } from "../../users/reducers/store";

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

  const { user, isLoggedIn } = useSelector((s: RootState) => s.auth);

  const [circle, setCircle] = useState<CircleResponse | null>(null);
  const [activeMembers, setActiveMembers] = useState<CircleMember[]>([]);
  const [myMember, setMyMember] = useState<CircleMember | null>(null);
  const [upcomingSchedules, setUpcomingSchedules] = useState<
    ScheduleResponse[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [selectedMember, setSelectedMember] = useState<CircleMember | null>(
    null,
  );
  const [profileModal, setProfileModal] = useState<CircleMember | null>(null);
  const [kakaoReady, setKakaoReady] = useState(false);
  const [selectedBoardId, setSelectedBoardId] = useState<number | null>(null);

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
            const schedRes = await scheduleApi.getSchedules(cid);
            const upcoming = schedRes.data
              .filter((s) => s.status === "UPCOMING")
              .slice(0, 6);
            setUpcomingSchedules(upcoming);
          } catch {
            // 일정 로드 실패 무시
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

  // 바깥 클릭 시 팝오버 닫기
  useEffect(() => {
    const close = () => setSelectedMember(null);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

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

  // 일정 변경 시 지도 초기화
  useEffect(() => {
    mapRef.current = null;
  }, [upcomingSchedules]);

  // 가장 가까운 위치 정보가 있는 일정
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
  const handleLeave = () => {
    if (!confirm("서클에서 탈퇴하시겠습니까?")) return;
    action(() => circleApi.leaveCircle(cid), "탈퇴했습니다.");
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
                height: 220,
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
              }}
            >
              {isLeader && (
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
            </div>
          </div>
        </div>

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
              <div style={{ marginBottom: 16 }}>
                <h2 style={sectionTitleStyle}>다가오는 일정</h2>
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
              ) : upcomingSchedules.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "32px 0",
                    color: "#bbb",
                  }}
                >
                  <p style={{ fontSize: 14, marginBottom: 8 }}>
                    예정된 일정이 없습니다.
                  </p>
                  <Link
                    to={`/circle/${cid}/schedules/create`}
                    style={{
                      fontSize: 13,
                      color: "#111",
                      fontWeight: 600,
                      textDecoration: "none",
                    }}
                  >
                    + 일정 만들기
                  </Link>
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
                    {upcomingSchedules.map((s) => {
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
                                  <span key={tag} style={{
                                    fontSize: 10, fontWeight: 600,
                                    padding: "2px 7px", borderRadius: 999,
                                    backgroundColor: "#eef2ff", color: "#6366f1",
                                  }}>
                                    {tag}
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
                  </Link>
                </>
              )}
            </div>

            <CircleBoardPostPreviewSection
              circleId={cid}
              selectedBoardId={selectedBoardId}
              onSelectedBoardChange={setSelectedBoardId}
            />
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
                            m.role === "LEADER" ? "#111" : "#e5e7eb",
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
                          stroke={m.role === "LEADER" ? "white" : "#6b7280"}
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
                    {nearestScheduleWithLocation.location && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                          marginBottom: 10,
                          fontSize: 12,
                          color: "#555",
                        }}
                      >
                        <MapPin size={13} color="#888" />
                        <span
                          style={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
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
            {/* 써클 게시판 */}
            <CircleBoardSideMenu
              circleId={cid}
              showAllItem
              currentBoardId={selectedBoardId ?? undefined}
              onBoardSelect={setSelectedBoardId}
            />
          </div>
        </div>
      </main>
      <Footer />
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
const smallBtnStyle: React.CSSProperties = {
  padding: "5px 12px",
  borderRadius: 6,
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
};
