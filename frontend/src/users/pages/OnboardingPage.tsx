import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { energyProfileApi } from '../../api/energyProfileApi';
import type { EnergyProfileRequest, EnergyProfileResponse } from '../../api/energyProfileApi';
import { setAuthFromOAuth } from '../reducers/authSlice';
import { authApi } from '../../api/authApi';
import type { AppDispatch } from '../reducers/store';
import { getErrorMessage } from '../../common/utils/errorMessage';

// ─── 질문 데이터 (유저 관점) ───

const questions = [
  {
    key: 'socialLoad' as const,
    title: '사회적 에너지',
    question: '모임에서 사람들과 대화하는 건 어떤가요?',
    options: [
      '거의 없는 게 편해요',
      '필요할 때만 간단히',
      '자연스럽게 적당히',
      '활발하게 자주',
      '대화가 많을수록 좋아요',
    ],
  },
  {
    key: 'interactionMode' as const,
    title: '활동 방식',
    question: '모임에서 활동은 어떻게 하고 싶나요?',
    options: [
      '혼자 하는 활동이 좋아요',
      '개인 활동 위주, 가끔 공유',
      '개인과 그룹 반반',
      '그룹 활동 위주, 가끔 개인',
      '항상 함께하는 활동이 좋아요',
    ],
  },
  {
    key: 'structureLevel' as const,
    title: '진행 방식',
    question: '모임의 진행 방식은 어떤 게 좋나요?',
    options: [
      '완전 자유로운 게 좋아요',
      '대략적인 흐름만 있으면 돼요',
      '기본 틀은 있지만 유연하게',
      '꽤 체계적으로 진행되면 좋겠어요',
      '명확한 일정과 규칙이 있으면 좋아요',
    ],
  },
  {
    key: 'activityIntensity' as const,
    title: '활동 강도',
    question: '어느 정도 에너지를 쓰는 모임이 좋나요?',
    options: [
      '매우 가볍게 (휴식처럼)',
      '가볍게 참여하는 정도',
      '보통 수준의 집중과 활동',
      '꽤 활발하거나 집중이 필요한',
      '높은 에너지가 필요한 활동',
    ],
  },
  {
    key: 'commitmentLevel' as const,
    title: '참여 빈도',
    question: '얼마나 자주 참여하고 싶나요?',
    options: [
      '오고 싶을 때만 자유롭게',
      '가끔 참여하는 정도',
      '정기적이지만 유연하게',
      '정기적으로 참여하고 싶어요',
      '매번 꼭 참석하고 싶어요',
    ],
  },
];

const TOTAL_STEPS = questions.length;

// ─── 컴포넌트 ───

export default function OnboardingPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [step, setStep] = useState(0); // 0~4: 질문, 5: 결과
  const [scores, setScores] = useState<EnergyProfileRequest>({
    socialLoad: 0,
    interactionMode: 0,
    structureLevel: 0,
    activityIntensity: 0,
    commitmentLevel: 0,
  });
  const [result, setResult] = useState<EnergyProfileResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const currentQuestion = questions[step];
  const currentKey = currentQuestion?.key;
  const currentValue = currentKey ? scores[currentKey] : 0;
  const isLastQuestion = step === TOTAL_STEPS - 1;
  const isResult = step === TOTAL_STEPS;

  const handleSelect = (value: number) => {
    if (!currentKey) return;
    setScores((prev) => ({ ...prev, [currentKey]: value }));
  };

  const handleNext = async () => {
    if (currentValue === 0) return; // 선택 안 했으면 무시

    if (isLastQuestion) {
      // 마지막 질문 → API 호출 → 결과 화면
      setLoading(true);
      setError('');
      try {
        const res = await energyProfileApi.create(scores);
        setResult(res.data);
        setStep(TOTAL_STEPS); // 결과 화면으로
        // Redux 상태 onboardingCompleted 갱신
        const refreshed = await authApi.refresh();
        localStorage.setItem('accessToken', refreshed.data.accessToken);
        dispatch(setAuthFromOAuth(refreshed.data.user));
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

  const handleFinish = () => {
    navigate('/');
  };

  return (
    <div style={containerStyle}>
      <div style={{ width: '100%', maxWidth: 480 }}>
        {/* 로고 */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <span style={{ fontSize: 28, fontWeight: 900, color: '#111', letterSpacing: -1 }}>
            moa
          </span>
          <p style={{ marginTop: 4, fontSize: 13, color: '#888' }}>
            {isResult ? '당신의 에너지 유형을 확인해보세요' : '나에게 맞는 모임을 찾아볼게요'}
          </p>
        </div>

        {/* 프로그레스 바 (질문 단계에서만) */}
        {!isResult && (
          <div style={progressContainerStyle}>
            <div
              style={{
                ...progressBarStyle,
                width: `${((step + 1) / TOTAL_STEPS) * 100}%`,
              }}
            />
          </div>
        )}

        {/* 카드 */}
        <div style={cardStyle}>
          {isResult && result ? (
            // ─── 결과 화면 ───
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  backgroundColor: '#f5f5f5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  fontSize: 32,
                }}
              >
                ⚡
              </div>
              <p style={{ fontSize: 13, color: '#888', marginBottom: 6 }}>
                당신의 에너지 유형은
              </p>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: '#111', marginBottom: 12 }}>
                {result.energyTypeName}
              </h2>
              <p style={{ fontSize: 14, color: '#555', lineHeight: 1.6, marginBottom: 24 }}>
                {result.energyTypeDescription}
              </p>

              {/* 추천 카테고리 */}
              {result.recommendedCategories && (
                <div
                  style={{
                    backgroundColor: '#f9f9f9',
                    borderRadius: 12,
                    padding: '16px 20px',
                    marginBottom: 24,
                    textAlign: 'left',
                  }}
                >
                  <p style={{ fontSize: 12, fontWeight: 600, color: '#888', marginBottom: 8 }}>
                    추천 카테고리
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {result.recommendedCategories.split(',').map((cat) => (
                      <span
                        key={cat.trim()}
                        style={{
                          fontSize: 13,
                          padding: '6px 14px',
                          borderRadius: 20,
                          backgroundColor: 'white',
                          border: '1px solid #e5e5e5',
                          color: '#333',
                          fontWeight: 500,
                        }}
                      >
                        {cat.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 에너지 점수 시각화 */}
              <div
                style={{
                  backgroundColor: '#f9f9f9',
                  borderRadius: 12,
                  padding: '16px 20px',
                  marginBottom: 28,
                  textAlign: 'left',
                }}
              >
                <p style={{ fontSize: 12, fontWeight: 600, color: '#888', marginBottom: 12 }}>
                  나의 에너지 프로필
                </p>
                {[
                  { label: '사회적 에너지', value: result.socialLoad },
                  { label: '활동 방식', value: result.interactionMode },
                  { label: '진행 방식', value: result.structureLevel },
                  { label: '활동 강도', value: result.activityIntensity },
                  { label: '참여 빈도', value: result.commitmentLevel },
                ].map((item) => (
                  <div key={item.label} style={{ marginBottom: 10 }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: 12,
                        color: '#666',
                        marginBottom: 4,
                      }}
                    >
                      <span>{item.label}</span>
                      <span style={{ fontWeight: 600 }}>{item.value}/5</span>
                    </div>
                    <div
                      style={{
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: '#e5e5e5',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${(item.value / 5) * 100}%`,
                          backgroundColor: '#111',
                          borderRadius: 3,
                          transition: 'width 0.3s ease',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <button onClick={handleFinish} style={primaryBtnStyle}>
                시작하기
              </button>
            </div>
          ) : (
            // ─── 질문 화면 ───
            <>
              <div style={{ marginBottom: 24 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#888', marginBottom: 6 }}>
                  {step + 1} / {TOTAL_STEPS}
                </p>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#111', marginBottom: 2 }}>
                  {currentQuestion.title}
                </p>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: '#111', lineHeight: 1.4 }}>
                  {currentQuestion.question}
                </h2>
              </div>

              {/* 선택지 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
                {currentQuestion.options.map((label, idx) => {
                  const value = idx + 1;
                  const selected = currentValue === value;
                  return (
                    <label
                      key={value}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '14px 16px',
                        borderRadius: 12,
                        cursor: 'pointer',
                        border: `1.5px solid ${selected ? '#111' : '#e5e5e5'}`,
                        backgroundColor: selected ? '#f5f5f5' : 'white',
                        transition: 'all 0.15s',
                      }}
                    >
                      <input
                        type="radio"
                        name={currentKey}
                        value={value}
                        checked={selected}
                        onChange={() => handleSelect(value)}
                        style={{ accentColor: '#111', width: 18, height: 18, flexShrink: 0 }}
                      />
                      <span
                        style={{
                          fontSize: 14,
                          color: selected ? '#111' : '#555',
                          fontWeight: selected ? 600 : 400,
                        }}
                      >
                        {label}
                      </span>
                    </label>
                  );
                })}
              </div>

              {/* 에러 메시지 */}
              {error && (
                <p
                  style={{
                    fontSize: 13,
                    color: '#ff4d4f',
                    textAlign: 'center',
                    marginBottom: 12,
                  }}
                >
                  {error}
                </p>
              )}

              {/* 이전/다음 버튼 */}
              <div style={{ display: 'flex', gap: 10 }}>
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
                    cursor: currentValue === 0 || loading ? 'not-allowed' : 'pointer',
                  }}
                >
                  {loading
                    ? '분석 중...'
                    : isLastQuestion
                      ? '결과 보기'
                      : '다음'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── 스타일 ───

const containerStyle: React.CSSProperties = {
  minHeight: '100vh',
  backgroundColor: '#f7f7f8',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '24px 16px',
};

const progressContainerStyle: React.CSSProperties = {
  height: 4,
  backgroundColor: '#e5e5e5',
  borderRadius: 2,
  marginBottom: 20,
  overflow: 'hidden',
};

const progressBarStyle: React.CSSProperties = {
  height: '100%',
  backgroundColor: '#111',
  borderRadius: 2,
  transition: 'width 0.3s ease',
};

const cardStyle: React.CSSProperties = {
  backgroundColor: 'white',
  borderRadius: 16,
  padding: '32px 28px',
  boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
};

const primaryBtnStyle: React.CSSProperties = {
  width: '100%',
  height: 48,
  backgroundColor: '#111',
  color: 'white',
  border: 'none',
  borderRadius: 12,
  fontSize: 15,
  fontWeight: 700,
  cursor: 'pointer',
};

const secondaryBtnStyle: React.CSSProperties = {
  width: 100,
  height: 48,
  backgroundColor: 'white',
  color: '#666',
  border: '1.5px solid #e0e0e0',
  borderRadius: 12,
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
};
