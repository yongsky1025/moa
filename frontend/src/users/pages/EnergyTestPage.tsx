import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { energyProfileApi, guestEnergyApi } from "../../api/usersApi";
import type { EnergyProfileRequest } from "../../api/usersApi";
import { authApi } from "../../api/authApi";
import { useAuthStore } from "../../store/authStore";
import { getErrorMessage } from "../../common/utils/errorMessage";
import SignUpStepper from "../components/SignUpStepper";
import { clearGuestEnergyImportIntent } from "../../common/utils/transientNavigationState";

// ─── 질문 데이터 ───

const questions = [
  {
    key: "socialLoad" as const,
    title: "사교 범위",
    question: "모임에서 사람들과 대화하는 건 어떤가요?",
    options: ["거의 없는 게 편해요", "필요할 때만 간단히", "자연스럽게 적당히", "활발하게 자주", "대화가 많을수록 좋아요"],
  },
  {
    key: "interactionMode" as const,
    title: "움직임",
    question: "모임에서 활동은 어떻게 하고 싶나요?",
    options: ["혼자 하는 활동이 좋아요", "개인 활동 위주, 가끔 공유", "개인과 그룹 반반", "그룹 활동 위주, 가끔 개인", "항상 함께하는 활동이 좋아요"],
  },
  {
    key: "structureLevel" as const,
    title: "구조감",
    question: "모임의 진행 방식은 어떤 게 좋나요?",
    options: [
      "완전 자유로운 게 좋아요",
      "대략적인 흐름만 있으면 돼요",
      "기본 틀은 있지만 유연하게",
      "꽤 체계적으로 진행되면 좋겠어요",
      "명확한 일정과 규칙이 있으면 좋아요",
    ],
  },
  {
    key: "activityIntensity" as const,
    title: "몰입도",
    question: "어느 정도 에너지를 쓰는 모임이 좋나요?",
    options: [
      "매우 가볍게 (휴식처럼)",
      "가볍게 참여하는 정도",
      "보통 수준의 집중과 활동",
      "꽤 활발하거나 집중이 필요한",
      "높은 에너지가 필요한 활동",
    ],
  },
  {
    key: "commitmentLevel" as const,
    title: "참여 빈도",
    question: "얼마나 자주 참여하고 싶나요?",
    options: ["오고 싶을 때만 자유롭게", "가끔 참여하는 정도", "정기적이지만 유연하게", "정기적으로 참여하고 싶어요", "매번 꼭 참석하고 싶어요"],
  },
];

const TOTAL_STEPS = questions.length;

// ─── 컴포넌트 ───

export default function EnergyTestPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode"); // "onboarding" | "retest" | null

  const [step, setStep] = useState(0);
  const [scores, setScores] = useState<EnergyProfileRequest>({
    socialLoad: 0,
    interactionMode: 0,
    structureLevel: 0,
    activityIntensity: 0,
    commitmentLevel: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasProfile, setHasProfile] = useState(false);

  const currentQuestion = questions[step];
  const currentKey = currentQuestion?.key;
  const currentValue = currentKey ? scores[currentKey] : 0;
  const isLastQuestion = step === TOTAL_STEPS - 1;

  // 온보딩 모드인데 이미 프로필이 있으면 결과 페이지로 스킵
  useEffect(() => {
    // guest/비로그인 상태에서는 로그인 전용 energy-profile checkAPI 호출X
    if (!isLoggedIn) {
      setHasProfile(false);
      return;
    }

    // 로그인 유저만 check() 호출
    energyProfileApi
      .check()
      .then(() => {
        if (mode === "onboarding") {
          navigate("/main", { replace: true });
        } else {
          setHasProfile(true);
        }
      })
      .catch(() => {
        // 로그인은 되어 있지만, 에너지 프로필 없으면 create 흐름으로 진행
        setHasProfile(false);
      });
  }, [isLoggedIn, mode, navigate]);

  const handleSelect = (value: number) => {
    if (!currentKey) return;
    setScores((prev) => ({ ...prev, [currentKey]: value }));
  };

  const handleNext = async () => {
    if (currentValue === 0) return;

    if (isLastQuestion) {
      setLoading(true);
      setError("");
      try {
        if (isLoggedIn) {
          // 로그인 유저는 기존 로직 그대로 사용
          if (hasProfile) {
            await energyProfileApi.update(scores);
          } else {
            await energyProfileApi.create(scores);
          }

          // 로그인 유저의 auth 상태 갱신
          const refreshed = await authApi.refresh();
          setAuth(refreshed.data.accessToken, refreshed.data.user);
          navigate("/users/energy-test/result", { replace: true });

          // 이전에 남은 guest 토큰 있으면 제거
          localStorage.removeItem("guestEnergyToken");
          clearGuestEnergyImportIntent();

          navigate("/users/energy-test/result", { replace: true });
        } else {
          // gust는 실제 유저 프로필 저장 대신 preview 토큰만 발급받음
          const res = await guestEnergyApi.issueToken(scores);
          clearGuestEnergyImportIntent();
          console.log("issued guest token", res.data.guestToken);
          localStorage.setItem("guestEnergyToken", res.data.guestToken);
          console.log("stored guest token", localStorage.getItem("guestEnergyToken"));
          navigate("/users/energy-test/result?guest=1", { replace: true });
        }
      } catch (e) {
        setError(getErrorMessage(e));
      } finally {
        setLoading(false);
      }
    } else {
      setStep((s) => s + 1);
    }
  };

  const handlePrev = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  return (
    <div style={containerStyle}>
      {/* 상단 헤더 영역 — 풀 width 배경 */}
      <div style={headerBgStyle}>
        <div style={{ width: "100%", maxWidth: 480, margin: "0 auto", padding: "0 16px" }}>
          {/* 로고 */}
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <span style={{ fontSize: 30, fontWeight: 900, color: "#1F2937", letterSpacing: -1 }}>moa</span>
            <p style={{ marginTop: 6, fontSize: 12, color: "#9CA3AF" }}>
              {mode === "retest" ? "에너지 프로필을 다시 설정해요" : "나의 에너지 유형을 알아볼게요."}
            </p>
          </div>

          {/* 온보딩 모드일 때만 스텝 바 표시 */}
          {mode === "onboarding" && <SignUpStepper currentStep={3} />}
        </div>
      </div>

      {/* 프로그레스 바 — 헤더와 카드 사이 */}
      <div style={{ width: "100%", maxWidth: 480, padding: "16px 16px 0" }}>
        <div style={progressContainerStyle}>
          <div style={{ ...progressBarStyle, width: `${((step + 1) / TOTAL_STEPS) * 100}%` }} />
        </div>
      </div>

      {/* 질문 영역 — 카드 */}
      <div style={{ width: "100%", maxWidth: 480, padding: "0 16px" }}>
        <div style={cardStyle}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 400, color: "#999" }}>
                {step + 1} / {TOTAL_STEPS}
              </span>
              <span style={{ width: 3, height: 3, borderRadius: "50%", backgroundColor: "#A9C8BB" }} />
              <span style={{ fontSize: 14, fontWeight: 600, color: "#5F8F7B" }}>{currentQuestion.title}</span>
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#111", lineHeight: 1.4 }}>{currentQuestion.question}</h2>
          </div>

          {/* 선택지 */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 20 }}>
            {currentQuestion.options.map((label, idx) => {
              const value = idx + 1;
              const selected = currentValue === value;
              return (
                <label
                  key={value}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 12px",
                    borderRadius: 6,
                    cursor: "pointer",
                    backgroundColor: selected ? "#E1F5EE" : "transparent",
                    transition: "all 0.15s ease",
                  }}
                >
                  <input
                    type="radio"
                    name={currentKey}
                    value={value}
                    checked={selected}
                    onChange={() => handleSelect(value)}
                    style={{
                      position: "absolute",
                      opacity: 0,
                      pointerEvents: "none",
                    }}
                  />
                  <span
                    aria-hidden="true"
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      border: `1.5px solid ${selected ? "#0F6E56" : "#9CA3AF"}`,
                      backgroundColor: selected ? "#D7EFE7" : "#FFFFFF",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      transition: "all 0.15s ease",
                    }}
                  >
                    <span
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        backgroundColor: "#0F6E56",
                        transform: selected ? "scale(1)" : "scale(0)",
                        opacity: selected ? 1 : 0,
                        transition: "all 0.15s ease",
                      }}
                    />
                  </span>
                  <span style={{ fontSize: 14, color: selected ? "#0F6E56" : "#4B5563", fontWeight: selected ? 600 : 400 }}>{label}</span>
                </label>
              );
            })}
          </div>

          {error && <p style={{ fontSize: 13, color: "#ff4d4f", textAlign: "center", marginBottom: 12 }}>{error}</p>}

          {/* 이전/다음 버튼 */}
          <div style={{ display: "flex", gap: 10 }}>
            {step > 0 && (
              <button onClick={handlePrev} style={secondaryBtnStyle}>
                이전
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={currentValue === 0 || loading}
              style={{
                ...primaryBtnStyle,
                flex: 1,
                backgroundColor: currentValue === 0 || loading ? "transparent" : "#0F6E56",
                color: currentValue === 0 || loading ? "#999" : "#FFFFFF",
                border: currentValue === 0 || loading ? "1px solid #DDD" : "none",
                cursor: currentValue === 0 || loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "분석 중..." : isLastQuestion ? "결과 보기" : "다음"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 스타일 ───

const containerStyle: React.CSSProperties = {
  minHeight: "100vh",
  backgroundColor: "#f7f7f8",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "flex-start",
  padding: 0,
};

const headerBgStyle: React.CSSProperties = {
  width: "100%",
  background: "rgba(95, 143, 123, 0.10)",
  padding: "32px 0 24px",
  textAlign: "center" as const,
};

const progressContainerStyle: React.CSSProperties = {
  height: 8,
  backgroundColor: "#E8E8E8",
  borderRadius: 4,
  marginBottom: 0,
  overflow: "hidden",
};

const progressBarStyle: React.CSSProperties = {
  height: "100%",
  backgroundColor: "#5F8F7B",
  borderRadius: 4,
  transition: "width 0.3s ease",
};

const cardStyle: React.CSSProperties = {
  backgroundColor: "#FFFFFF",
  borderRadius: 12,
  padding: "28px 24px",
  boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
  marginTop: 16,
};

const primaryBtnStyle: React.CSSProperties = {
  width: "100%",
  height: 48,
  backgroundColor: "#0F6E56",
  color: "white",
  border: "none",
  borderRadius: 12,
  fontSize: 15,
  fontWeight: 700,
  cursor: "pointer",
  transition: "background-color 0.15s ease, color 0.15s ease",
};

const secondaryBtnStyle: React.CSSProperties = {
  width: 100,
  height: 48,
  backgroundColor: "white",
  color: "#666",
  border: "1.5px solid #e0e0e0",
  borderRadius: 12,
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
};
