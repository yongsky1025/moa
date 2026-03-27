import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import { BookOpen, Trees, Coffee, Mountain, Eye, Footprints, Presentation, Flame } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { EnergyProfileResponse } from "../../api/usersApi";
import { energyProfileApi } from "../../api/usersApi";
import Footer from "../../common/layout/Footer";
import Navbar from "../../common/layout/Navbar";

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

export default function EnergyResultPage() {
  const navigate = useNavigate();
  const [result, setResult] = useState<EnergyProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<"" | "NO_RESULT" | "LOAD_FAILED">("");

  useEffect(() => {
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
  }, [navigate]);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f7f7f8" }}>
      <Navbar />
      <main style={{ maxWidth: 480, margin: "0 auto", padding: "40px 20px 80px" }}>
        {loading && <p style={{ textAlign: "center", color: "#888", fontSize: 14 }}>불러오는 중...</p>}

        {error === "NO_RESULT" && (
          <div
            style={{
              backgroundColor: "white",
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
              backgroundColor: "white",
              borderRadius: 16,
              padding: "32px 28px",
              boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
              textAlign: "center",
            }}
          >
            <p style={{ fontSize: 14, color: "#888", marginBottom: 20 }}>결과를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.</p>
            <button onClick={() => window.location.reload()} style={primaryBtnStyle}>
              {" "}
              다시 시도{" "}
            </button>
          </div>
        )}

        {!loading && result && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* 히어로 카드 */}
            <div
              style={{
                backgroundColor: "#f9f9f9",
                borderRadius: 16,
                padding: "36px 20px 28px",
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                textAlign: "center",
              }}
            >
              {(() => {
                const Icon = ENERGY_TYPE_ICONS[result.energyTypeName];
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
                    {Icon ? <Icon size={56} color="#0F6E56" strokeWidth={1.5} /> : <span style={{ fontSize: 56 }}>⚡</span>}
                  </div>
                );
              })()}
              <p style={{ fontSize: 13, color: "#888", marginBottom: 6 }}>당신의 에너지 유형은</p>
              <h2 style={{ fontSize: 26, fontWeight: 800, color: "#0F6E56", marginBottom: 8, letterSpacing: "-0.3px" }}>
                {result.energyTypeName}
              </h2>
              <p style={{ fontSize: 14, color: "#555", lineHeight: 1.7 }}>{result.energyTypeDescription}</p>
            </div>

            {/* 추천 카테고리 카드 */}
            {result.recommendedCategories && (
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#1F2937", marginBottom: 8, paddingLeft: 4 }}>추천 카테고리</p>
                <div
                  style={{
                    backgroundColor: "#f9f9f9",
                    borderRadius: 16,
                    padding: "18px 20px",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                  }}
                >
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {result.recommendedCategories.split(",").map((cat) => (
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

            {/* 에너지 프로필 카드 */}
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#1F2937", marginBottom: 8, paddingLeft: 4 }}>나의 에너지 프로필</p>
              <div
                style={{
                  backgroundColor: "#f9f9f9",
                  borderRadius: 16,
                  padding: "16px 20px",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                }}
              >
                <ResponsiveContainer width="100%" height={260}>
                  <RadarChart
                    data={[
                      { label: "사교\n범위", value: result.socialLoad },
                      { label: "움직임", value: result.interactionMode },
                      { label: "구조감", value: result.structureLevel },
                      { label: "몰입도", value: result.activityIntensity },
                      { label: "참여\n빈도", value: result.commitmentLevel },
                    ]}
                    margin={{ top: 16, right: 24, bottom: 16, left: 24 }}
                  >
                    <PolarGrid stroke="#D1D5DB" />
                    <PolarRadiusAxis domain={[0, 5]} tick={false} axisLine={false} />
                    <PolarAngleAxis dataKey="label" tick={{ fontSize: 11, fill: "#6B7280", fontWeight: 500 }} />
                    <Radar dataKey="value" stroke="#5F8F7B" fill="#5F8F7B" fillOpacity={0.25} strokeWidth={2} dot={{ r: 3, fill: "#5F8F7B" }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <button
              onClick={() => navigate("/users/energy-test?mode=retest")}
              style={{ ...primaryBtnStyle, backgroundColor: "#EAF4F0", color: "#5F8F7B", border: "none" }}
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

const primaryBtnStyle: React.CSSProperties = {
  width: "100%",
  height: 48,
  backgroundColor: "#111",
  color: "white",
  border: "none",
  borderRadius: 12,
  fontSize: 15,
  fontWeight: 700,
  cursor: "pointer",
};
