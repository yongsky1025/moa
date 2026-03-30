import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { energyProfileApi } from "../../api/usersApi";
import type { EnergyProfileRequest } from "../../api/usersApi";
import { authApi } from "../../api/authApi";
import { useAuthStore } from "../../store/authStore";
import { getErrorMessage } from "../../common/utils/errorMessage";
import SignUpStepper from "../components/SignUpStepper";

// ─── 질문 데이터 ───

const questions = [
  {
    key: "socialLoad" as const,
    title: "사회적 에너지",
    question: "모임에서 사람들과 대화하는 건 어떤가요?",
    options: ["거의 없는 게 편해요", "필요할 때만 간단히", "자연스럽게 적당히", "활발하게 자주", "대화가 많을수록 좋아요"],
  },
  {
    key: "interactionMode" as const,
    title: "활동 방식",
    question: "모임에서 활동은 어떻게 하고 싶나요?",
    options: ["혼자 하는 활동이 좋아요", "개인 활동 위주, 가끔 공유", "개인과 그룹 반반", "그룹 활동 위주, 가끔 개인", "항상 함께하는 활동이 좋아요"],
  },
  {
    key: "structureLevel" as const,
    title: "진행 방식",
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
    title: "활동 강도",
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
        // 프로필 없음 = 정상, 테스트 진행
      });
  }, []);

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
        // retest면 update, 그 외(onboarding 포함)는 create
        if (hasProfile) {
          await energyProfileApi.update(scores);
        } else {
          await energyProfileApi.create(scores);
        }
        // auth 상태 갱신
        const refreshed = await authApi.refresh();
        setAuth(refreshed.data.accessToken, refreshed.data.user);
        navigate("/users/energy-test/result", { replace: true });
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
      <div style={{ width: "100%", maxWidth: 480 }}>
        {/* 로고 */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <span style={{ fontSize: 28, fontWeight: 900, color: "#111", letterSpacing: -1 }}>moa</span>
          <p style={{ marginTop: 4, fontSize: 13, color: "#888" }}>
            {mode === "retest" ? "에너지 프로필을 다시 설정해요" : "나에게 맞는 모임을 찾아볼게요"}
          </p>
        </div>

        {/* 온보딩 모드일 때만 스텝 바 표시 */}
        {mode === "onboarding" && <SignUpStepper currentStep={3} />}

        {/* 프로그레스 바 */}
        <div style={progressContainerStyle}>
          <div style={{ ...progressBarStyle, width: `${((step + 1) / TOTAL_STEPS) * 100}%` }} />
        </div>

        {/* 카드 */}
        <div style={cardStyle}>
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: "#888", marginBottom: 6 }}>
              {step + 1} / {TOTAL_STEPS}
            </p>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#111", marginBottom: 2 }}>{currentQuestion.title}</p>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#111", lineHeight: 1.4 }}>{currentQuestion.question}</h2>
          </div>

          {/* 선택지 */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
            {currentQuestion.options.map((label, idx) => {
              const value = idx + 1;
              const selected = currentValue === value;
              return (
                <label
                  key={value}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "14px 16px",
                    borderRadius: 12,
                    cursor: "pointer",
                    border: `1.5px solid ${selected ? "#111" : "#e5e5e5"}`,
                    backgroundColor: selected ? "#f5f5f5" : "white",
                    transition: "all 0.15s",
                  }}
                >
                  <input
                    type="radio"
                    name={currentKey}
                    value={value}
                    checked={selected}
                    onChange={() => handleSelect(value)}
                    style={{ accentColor: "#111", width: 18, height: 18, flexShrink: 0 }}
                  />
                  <span style={{ fontSize: 14, color: selected ? "#111" : "#555", fontWeight: selected ? 600 : 400 }}>{label}</span>
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
                opacity: currentValue === 0 || loading ? 0.4 : 1,
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
  alignItems: "center",
  justifyContent: "center",
  padding: "24px 16px",
};

const progressContainerStyle: React.CSSProperties = {
  height: 4,
  backgroundColor: "#e5e5e5",
  borderRadius: 2,
  marginBottom: 20,
  overflow: "hidden",
};

const progressBarStyle: React.CSSProperties = {
  height: "100%",
  backgroundColor: "#111",
  borderRadius: 2,
  transition: "width 0.3s ease",
};

const cardStyle: React.CSSProperties = {
  backgroundColor: "white",
  borderRadius: 16,
  padding: "32px 28px",
  boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
};

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
