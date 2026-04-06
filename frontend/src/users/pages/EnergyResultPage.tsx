import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import { BookOpen, Trees, Coffee, Mountain, Eye, Footprints, Presentation, Flame, Users, ChevronLeft } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { EnergyProfileResponse, GuestEnergyPreviewResponse } from "../../api/usersApi";
import { energyProfileApi, guestEnergyApi } from "../../api/usersApi";
import { useAuthStore } from "../../store/authStore";
import { circleApi } from "../../api/circleApi";
import type { EnergyRecommendationItem } from "../types/energy";
import Footer from "../../common/layout/Footer";
import Navbar from "../../common/layout/Navbar";
import { clearGuestEnergyImportIntent, setGuestEnergyImportIntent } from "../../common/utils/transientNavigationState";
import { toAssetUrl } from "../../common/utils/assetUrl";

const MOA_PRIMARY = "#0F6E56";

const ENERGY_TYPE_ICONS: Record<string, LucideIcon> = {
  "고요한 몰입형": BookOpen,
  "가벼운 산책형": Trees,
  "조용한 교류형": Coffee,
  "소규모 액션형": Mountain,
  "잔잔한 관람형": Eye,
  "페이스 동행형": Footprints,
  "구조적 교류형": Presentation,
  "에너지 확산형": Flame,
};

/** 설명 텍스트를 의미 단위로 끊어 두 줄로 분리 (1줄 ≥ 2줄) */
function splitDescription(text: string): string {
  // 한국어 조사/어미 뒤를 줄바꿈 후보로 본다
  const breakAfter = /([가-힣]+(?:에서|속에서|보다|으며|하며|면서|때|와|과|지만|않고|없이) )/g;
  const candidates: number[] = [];
  let m: RegExpExecArray | null;
  while ((m = breakAfter.exec(text)) !== null) {
    candidates.push(m.index + m[0].length);
  }
  if (candidates.length === 0) return text;

  // 1줄이 2줄보다 길거나 같은 지점 중 전체 중앙에 가장 가까운 곳 선택
  const mid = text.length / 2;
  let best = candidates[0];
  for (const pos of candidates) {
    if (pos >= mid * 0.45 && pos <= text.length * 0.75) {
      if (pos >= text.length - pos) {
        best = pos;
        break;
      }
      best = pos;
    }
  }

  const line1 = text.slice(0, best).trim();
  const line2 = text.slice(best).trim();
  if (!line2) return text;
  return `${line1}\n${line2}`;
}

export default function EnergyResultPage() {
  const navigate = useNavigate();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

  const [result, setResult] = useState<EnergyProfileResponse | null>(null);
  const [guestPreview, setGuestPreview] = useState<GuestEnergyPreviewResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<"" | "NO_RESULT" | "LOAD_FAILED">("");
  const [recommendations, setRecommendations] = useState<EnergyRecommendationItem[]>([]);
  const [overallReason, setOverallReason] = useState<string | null>(null);
  const [recLoading, setRecLoading] = useState(false);


  const guestToken = localStorage.getItem("guestEnergyToken");
  const isGuestPreview = !isLoggedIn && !!guestToken;

  useEffect(() => {
    // guest preview 토큰이 있으면 로그인 전용 API를 치지 않고 preview만 조회
    if (isGuestPreview && guestToken) {
      guestEnergyApi
        .getPreview(guestToken)
        .then((data) => setGuestPreview(data))
        .catch((e) => {
          const status = e?.response?.status;
          if (status === 401) {
            localStorage.removeItem("guestEnergyToken");
            clearGuestEnergyImportIntent();
            navigate("/users/energy-test", { replace: true });
            return;
          }
          setError("LOAD_FAILED");
        })
        .finally(() => setLoading(false));

      return;
    }

    // 비로그인 + guest 토큰도 없으면 보여줄 결과가 없음
    if (!isLoggedIn && !guestToken) {
      setError("NO_RESULT");
      setLoading(false);
      return;
    }

    // 로그인 유저는 기존 실제 결과 조회
    energyProfileApi
      .check()
      .then((res) => setResult(res.data))
      .catch((e) => {
        const status = e?.response?.status;

        if (status === 401) {
          navigate("/users/login?error=" + encodeURIComponent("로그인이 필요합니다."));
          return;
        }

        if (status === 404 || status === 400) {
          setError("NO_RESULT");
          return;
        }

        setError("LOAD_FAILED");
      })
      .finally(() => setLoading(false));
  }, [guestToken, isGuestPreview, isLoggedIn, navigate]);

  useEffect(() => {
    // guest는 추천 모임/추천 이유를 아직 안 내려주므로 호출하지 않음
    if (isGuestPreview || !isLoggedIn) {
      setRecommendations([]);
      setOverallReason(null);
      return;
    }

    setRecLoading(true);
    circleApi
      .getRecommendationBundle(3)
      .then((res) => {
        setRecommendations(res.data.overall as EnergyRecommendationItem[]);
        setOverallReason(res.data.overallReason ?? null);
      })
      .catch(() => {})
      .finally(() => setRecLoading(false));
  }, [isGuestPreview, isLoggedIn]);

  const podiumOrder = [recommendations[1], recommendations[0], recommendations[2]];

  const displayProfile = isGuestPreview ? guestPreview : result;

  const radarData =
    isGuestPreview && guestPreview
      ? [
          { label: "사교\n범위", value: guestPreview.exampleSocialLoad },
          { label: "움직임", value: guestPreview.exampleInteractionMode },
          { label: "구조감", value: guestPreview.exampleStructureLevel },
          { label: "몰입도", value: guestPreview.exampleActivityIntensity },
          { label: "참여\n빈도", value: guestPreview.exampleCommitmentLevel },
        ]
      : result
        ? [
            { label: "사교\n범위", value: result.socialLoad },
            { label: "움직임", value: result.interactionMode },
            { label: "구조감", value: result.structureLevel },
            { label: "몰입도", value: result.activityIntensity },
            { label: "참여\n빈도", value: result.commitmentLevel },
          ]
        : [];

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f7f7f8" }}>
      <Navbar />
      <main style={{ maxWidth: 480, margin: "0 auto", padding: "40px 20px 80px" }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#6B7280",
            fontSize: 13,
            fontWeight: 500,
            padding: 0,
            marginBottom: 16,
          }}
        >
          <ChevronLeft size={18} />
          이전 페이지로 돌아가기
        </button>
        {loading && <p style={{ textAlign: "center", color: "#888", fontSize: 14 }}>불러오는 중...</p>}

        {error === "NO_RESULT" && (
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: 16,
              padding: "32px 28px",
              boxShadow: "0 8px 24px rgba(31, 45, 61, 0.06)",
              textAlign: "center",
            }}
          >
            <p style={{ fontSize: 14, color: "#888", marginBottom: 20 }}>아직 에너지 프로필이 없어요.</p>
            <button onClick={() => navigate("/users/energy-test")} style={primaryBtnStyle}>
              에너지 테스트 하러 가기
            </button>
          </div>
        )}

        {error === "LOAD_FAILED" && (
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: 16,
              padding: "32px 28px",
              boxShadow: "0 2px 16px rgba(0, 0, 0, 0.07)",
              textAlign: "center",
            }}
          >
            <p style={{ fontSize: 14, color: "#888", marginBottom: 20 }}>결과를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.</p>
            <button onClick={() => window.location.reload()} style={primaryBtnStyle}>
              다시 시도
            </button>
          </div>
        )}

        {!loading && displayProfile && (
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <div
              style={{
                backgroundColor: "#f9f9f9",
                borderRadius: 16,
                padding: "36px 20px 28px",
                boxShadow: "0 2px 12px rgba(0, 0, 0, 0.06)",
                textAlign: "center",
              }}
            >
              {(() => {
                const Icon = ENERGY_TYPE_ICONS[displayProfile.energyTypeName];

                return (
                  <div
                    style={{
                      width: 120,
                      height: 120,
                      borderRadius: "50%",
                      backgroundColor: "#E1F5EE",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 24px",
                    }}
                  >
                    {Icon ? <Icon size={56} color={MOA_PRIMARY} strokeWidth={1.5} /> : <span style={{ fontSize: 56 }}>⚡</span>}
                  </div>
                );
              })()}
              <p style={{ fontSize: 13, color: "#888", marginBottom: 6 }}>당신의 에너지 유형은</p>
              <h2 style={{ fontSize: 26, fontWeight: 800, color: MOA_PRIMARY, marginBottom: 16, letterSpacing: "-0.3px" }}>
                {displayProfile.energyTypeName}
              </h2>
              <div style={{ width: 40, height: 2, background: "#A9C8BB", margin: "0 auto 16px", borderRadius: 1 }} />
              <p style={{ fontSize: 14, color: "#555", lineHeight: 1.7, whiteSpace: "pre-line" }}>
                {splitDescription(displayProfile.energyTypeDescription)}
              </p>
            </div>

            {displayProfile.recommendedCategories && (
              <div>
                <p style={sectionTitleStyle}>추천 카테고리</p>
                <div style={sectionCardStyle}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {displayProfile.recommendedCategories.split(",").map((cat) => (
                      <span
                        key={cat.trim()}
                        style={{
                          fontSize: 13,
                          padding: "6px 14px",
                          borderRadius: 20,
                          backgroundColor: "#5F8F7B",
                          color: "#ffffff",
                          fontWeight: 600,
                        }}
                      >
                        {cat.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div>
              <p style={sectionTitleStyle}>나의 에너지 프로필</p>
              <div style={{ ...sectionCardStyle, padding: "16px 20px" }}>
                {isGuestPreview && (
                  <p style={{ fontSize: 13, color: "#6B7280", margin: "0 0 4px", textAlign: "center" }}>
                    이 그래프는 <span style={{ fontWeight: 700, color: "#5F8F7B" }}>{displayProfile.energyTypeName}</span>의 대표 에너지 분포예요.
                  </p>
                )}
                <ResponsiveContainer width="100%" height={260}>
                  <RadarChart data={radarData} margin={{ top: 16, right: 24, bottom: 16, left: 24 }}>
                    <PolarGrid stroke="#D1D5DB" />
                    <PolarRadiusAxis domain={[0, 5]} tick={false} axisLine={false} />
                    <PolarAngleAxis dataKey="label" tick={{ fontSize: 12, fill: "#6B7280", fontWeight: 500 }} />
                    <Radar
                      dataKey="value"
                      stroke="#5F8F7B"
                      fill="rgba(95,143,123,0.25)"
                      fillOpacity={0.25}
                      strokeWidth={2}
                      dot={{ r: 3, fill: "#5F8F7B" }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
                <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
                  {radarData.map((d, i) => (
                    <span key={i} style={{ fontSize: 12, color: "#6B7280" }}>
                      <span style={{ color: "#5F8F7B", fontWeight: 700 }}>{d.label.replace("\n", " ")}</span>
                      {" "}{d.value}
                      {i < radarData.length - 1 && <span style={{ margin: "0 2px", color: "#D1D5DB" }}> · </span>}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {isGuestPreview ? (
              <div>
                <p style={sectionTitleStyle}>나와 맞는 모임</p>
                <div
                  style={{
                    ...sectionCardStyle,
                    textAlign: "center",
                    border: "1px dashed #D1D5DB",
                    backgroundColor: "rgba(227,139,109,0.08)",
                  }}
                >
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#0F6E56", marginBottom: 8 }}>회원가입 후 공개</p>
                  <p style={{ fontSize: 13, color: "#666", lineHeight: 1.7, margin: 0 }}>
                    {guestPreview?.lockMessage ?? "회원가입하면 내 실제 결과와 맞춤 추천 모임을 확인할 수 있어요."}
                  </p>

                  <button
                    onClick={() => {
                      setGuestEnergyImportIntent();
                      navigate("/users/signup");
                    }}
                    style={{
                      ...primaryBtnStyle,
                      marginTop: 16,
                      backgroundColor: "#E38B6D",
                    }}
                  >
                    회원가입하고 실제 결과 보기
                  </button>
                </div>
              </div>
            ) : (
              (recLoading || recommendations.length > 0) && (
                <div>
                  <p style={sectionTitleStyle}>나와 맞는 모임</p>

                  {recLoading ? (
                    <p style={{ textAlign: "center", color: "#888", fontSize: 13, padding: "24px 0" }}>추천 모임 불러오는 중...</p>
                  ) : (
                    <>
                      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 12, marginBottom: 16 }}>
                        {podiumOrder.map((item, posIdx) => {
                          if (!item) return null;

                          const isBest = posIdx === 1;
                          const cardWidth = 148;
                          const imgHeight = 68;

                          return (
                            <div
                              key={item.circleId}
                              onClick={() => navigate(`/circle/${item.circleId}`)}
                              style={{
                                width: cardWidth,
                                backgroundColor: "#ffffff",
                                border: isBest ? `2px solid ${MOA_PRIMARY}` : "0.5px solid #e8e8e8",
                                borderRadius: 12,
                                padding: "14px 12px",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                textAlign: "center",
                                position: "relative",
                                cursor: "pointer",
                                transition: "border-color 0.15s",
                              }}
                            >
                              {isBest && (
                                <div
                                  style={{
                                    position: "absolute",
                                    top: -10,
                                    left: "50%",
                                    transform: "translateX(-50%)",
                                    backgroundColor: "#0F6E56",
                                    color: "#fff",
                                    fontSize: 10,
                                    fontWeight: 600,
                                    padding: "2px 10px",
                                    borderRadius: 4,
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  가장 잘 맞는 모임
                                </div>
                              )}

                              <div
                                style={{
                                  width: "100%",
                                  height: imgHeight,
                                  backgroundColor: "#f5f5f0",
                                  borderRadius: 8,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  marginBottom: 8,
                                  overflow: "hidden",
                                }}
                              >
                                {item.coverImageUrl ? (
                                  <img src={toAssetUrl(item.coverImageUrl)} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                ) : (
                                  <Users size={24} color="#999" strokeWidth={1.5} />
                                )}
                              </div>

                              <span style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a", marginBottom: 2 }}>{item.name}</span>
                              <span style={{ fontSize: 11, color: "#888", marginBottom: 6 }}>
                                {item.categoryName} · {item.currentMember}~{item.maxMember}명
                              </span>
                              <div style={{ marginTop: "auto", padding: "4px 8px", backgroundColor: "#E1F5EE", borderRadius: 6, textAlign: "center" }}>
                                <span style={{ fontSize: 12, fontWeight: 600, color: "#0F6E56", letterSpacing: 1 }}>
                                  {"★".repeat(item.starRating)}{"☆".repeat(3 - item.starRating)}
                                </span>
                                <p style={{ fontSize: 10, fontWeight: 500, color: "#085041", margin: "2px 0 0", lineHeight: 1.3 }}>
                                  {item.matchReason}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {overallReason && (
                        <div style={{ backgroundColor: "#ffffff", border: "0.5px solid #e8e8e8", borderRadius: 12, padding: "16px 20px" }}>
                          <p style={{ fontSize: 13, fontWeight: 500, color: "#0F6E56", margin: "0 0 8px" }}>이 모임들을 추천하는 이유</p>
                          <p style={{ fontSize: 13, color: "#555", margin: 0, lineHeight: 1.7 }}>{overallReason}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )
            )}

            <button
              onClick={() => {
                if (isGuestPreview) {
                  localStorage.removeItem("guestEnergyToken");
                  clearGuestEnergyImportIntent();
                  navigate("/users/energy-test", { replace: true });
                  return;
                }
                navigate("/users/energy-test?mode=retest");
              }}
              style={{ ...primaryBtnStyle, backgroundColor: "transparent", color: "#5F8F7B", border: "2px solid #5F8F7B" }}
            >
              테스트 다시 하기
            </button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

const sectionTitleStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 700,
  color: "#1F2937",
  marginBottom: 8,
  paddingLeft: 4,
};

const sectionCardStyle: React.CSSProperties = {
  backgroundColor: "#f9f9f9",
  borderRadius: 16,
  padding: "18px 20px",
  boxShadow: "0 2px 12px rgba(0, 0, 0, 0.06)",
};

const primaryBtnStyle: React.CSSProperties = {
  width: "100%",
  height: 48,
  backgroundColor: "#111",
  color: "#ffffff",
  border: "none",
  borderRadius: 12,
  fontSize: 15,
  fontWeight: 700,
  cursor: "pointer",
};
