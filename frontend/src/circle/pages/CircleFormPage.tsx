import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../common/layout/Navbar';
import Footer from '../../common/layout/Footer';
import { circleApi } from '../../api/circleApi';
import { getErrorMessage } from '../../common/utils/errorMessage';

interface Category {
  categoryId: number;
  categoryName: string;
}

const energyQuestions = [
  {
    key: 'socialLoad' as const,
    title: '사회적 에너지',
    question: '이 모임에서 참여자 간 대화는 어느 정도로 이루어지나요?',
    options: [
      '거의 없음 (각자 활동 중심)',
      '필요할 때만 간단히',
      '자연스럽게 적당히',
      '활발하게 자주',
      '대화가 핵심 활동',
    ],
  },
  {
    key: 'interactionMode' as const,
    title: '활동 방식',
    question: '모임의 주요 활동 방식은 어떤가요?',
    options: [
      '완전히 개인 활동 (각자 따로)',
      '개인 활동 위주, 가끔 공유',
      '개인과 그룹 활동 반반',
      '그룹 활동 위주, 가끔 개인',
      '항상 함께 하는 그룹 활동',
    ],
  },
  {
    key: 'structureLevel' as const,
    title: '진행 방식',
    question: '모임의 진행 방식은 얼마나 정해져 있나요?',
    options: [
      '완전 자유 (규칙 없음)',
      '대략적인 흐름만 있음',
      '기본 틀은 있지만 유연함',
      '꽤 체계적으로 진행',
      '명확한 일정과 규칙이 있음',
    ],
  },
  {
    key: 'activityIntensity' as const,
    title: '활동 강도',
    question: '모임 활동의 신체적/정신적 에너지 소모는 어느 정도인가요?',
    options: [
      '매우 가벼움 (휴식에 가까움)',
      '가볍게 참여',
      '보통 수준의 집중/활동',
      '꽤 활발하거나 집중 필요',
      '매우 높은 에너지 필요',
    ],
  },
  {
    key: 'commitmentLevel' as const,
    title: '참여 빈도',
    question: '참여자에게 기대하는 참여 빈도와 책임은 어느 정도인가요?',
    options: [
      '완전 자유 (오고 싶을 때만)',
      '가끔 참여 권장',
      '정기적 참여 권장하지만 유연',
      '정기적 참여 기대',
      '매 회 참석 필수',
    ],
  },
];

// step 0 = 기본 정보, step 1~5 = 에너지 질문
const TOTAL_ENERGY_STEPS = energyQuestions.length;

export default function CircleFormPage() {
  const { circleId } = useParams<{ circleId: string }>();
  const isEdit = !!circleId;
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: '',
    description: '',
    maxMember: 10,
    categoryId: 0,
    socialLoad: 0,
    interactionMode: 0,
    structureLevel: 0,
    activityIntensity: 0,
    commitmentLevel: 0,
  });
  const [currentMember, setCurrentMember] = useState(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [existingImageUrl, setExistingImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await circleApi.getCategories();
        const list = res.data.sort((a, b) => a.categoryName.localeCompare(b.categoryName));
        setCategories(list);
        if (!isEdit && list.length > 0) {
          setForm(prev => ({ ...prev, categoryId: list[0].categoryId }));
        }
      } catch {
        // 카테고리 로드 실패해도 폼은 표시
      }
    };
    fetchCategories();
  }, [isEdit]);

  useEffect(() => {
    if (!isEdit) return;
    const fetchCircle = async () => {
      try {
        const res = await circleApi.getCircle(Number(circleId));
        const c = res.data;
        setForm(prev => ({
          ...prev,
          name: c.name,
          description: c.description ?? '',
          maxMember: c.maxMember,
          categoryId: c.categoryId,
        }));
        setCurrentMember(c.currentMember);
        if (c.coverImageUrl) setExistingImageUrl(c.coverImageUrl);
      } catch {
        setError('모임 정보를 불러올 수 없습니다.');
      }
    };
    fetchCircle();
  }, [isEdit, circleId]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // 기본 정보 → 에너지 스텝으로
  const handleBasicNext = () => {
    setError('');
    if (!form.name.trim()) { setError('모임 이름을 입력해주세요.'); return; }
    if (form.categoryId === 0) { setError('카테고리를 선택해주세요.'); return; }
    setStep(1);
  };

  // 에너지 스텝 이전/다음
  const handleEnergyPrev = () => setStep(s => s - 1);

  const handleEnergyNext = async () => {
    const q = energyQuestions[step - 1];
    if (form[q.key] === 0) return;

    if (step < TOTAL_ENERGY_STEPS) {
      setStep(s => s + 1);
      return;
    }

    // 마지막 에너지 스텝 → 제출
    setLoading(true);
    setError('');
    try {
      const res = await circleApi.createCircle({
        name: form.name,
        description: form.description,
        maxMember: form.maxMember,
        categoryId: form.categoryId,
        socialLoad: form.socialLoad,
        interactionMode: form.interactionMode,
        structureLevel: form.structureLevel,
        activityIntensity: form.activityIntensity,
        commitmentLevel: form.commitmentLevel,
      }, imageFile ?? undefined);
      navigate(res.data?.circleId ? `/circle/${res.data.circleId}` : '/circle');
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  // 수정 제출
  const handleEditSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await circleApi.updateCircle(Number(circleId), {
        name: form.name,
        description: form.description,
        maxMember: form.maxMember,
      });
      if (imageFile) {
        await circleApi.uploadCoverImage(Number(circleId), imageFile);
      }
      navigate(`/circle/${circleId}`);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  // ─── 에너지 스텝 화면 (생성 시 step 1~5) ───
  if (!isEdit && step >= 1) {
    const q = energyQuestions[step - 1];
    const currentValue = form[q.key];
    const isLastStep = step === TOTAL_ENERGY_STEPS;

    return (
      <div style={containerStyle}>
        <div style={{ width: '100%', maxWidth: 480 }}>
          {/* 로고 */}
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <span style={{ fontSize: 28, fontWeight: 900, color: '#111', letterSpacing: -1 }}>moa</span>
            <p style={{ marginTop: 4, fontSize: 13, color: '#888' }}>모임의 성격을 설정해주세요</p>
          </div>

          {/* 프로그레스 바 */}
          <div style={progressContainerStyle}>
            <div style={{ ...progressBarStyle, width: `${(step / TOTAL_ENERGY_STEPS) * 100}%` }} />
          </div>

          {/* 카드 */}
          <div style={cardStyle}>
            <div style={{ marginBottom: 24 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#888', marginBottom: 6 }}>
                {step} / {TOTAL_ENERGY_STEPS}
              </p>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#111', marginBottom: 2 }}>{q.title}</p>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#111', lineHeight: 1.4 }}>{q.question}</h2>
            </div>

            {/* 선택지 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
              {q.options.map((label, idx) => {
                const value = idx + 1;
                const selected = currentValue === value;
                return (
                  <label
                    key={value}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '14px 16px', borderRadius: 12, cursor: 'pointer',
                      border: `1.5px solid ${selected ? '#111' : '#e5e5e5'}`,
                      backgroundColor: selected ? '#f5f5f5' : 'white',
                      transition: 'all 0.15s',
                    }}
                  >
                    <input
                      type="radio"
                      name={q.key}
                      value={value}
                      checked={selected}
                      onChange={() => setForm(prev => ({ ...prev, [q.key]: value }))}
                      style={{ accentColor: '#111', width: 18, height: 18, flexShrink: 0 }}
                    />
                    <span style={{ fontSize: 14, color: selected ? '#111' : '#555', fontWeight: selected ? 600 : 400 }}>
                      {label}
                    </span>
                  </label>
                );
              })}
            </div>

            {error && (
              <p style={{ fontSize: 13, color: '#ff4d4f', textAlign: 'center', marginBottom: 12 }}>{error}</p>
            )}

            {/* 이전/다음 버튼 */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={handleEnergyPrev} style={secondaryBtnStyle}>
                이전
              </button>
              <button
                onClick={handleEnergyNext}
                disabled={currentValue === 0 || loading}
                style={{
                  ...primaryBtnStyle,
                  flex: 1,
                  opacity: currentValue === 0 || loading ? 0.4 : 1,
                  cursor: currentValue === 0 || loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? '처리 중...' : isLastStep ? '모임 만들기' : '다음'}
              </button>
            </div>
          </div>

          <p style={{ fontSize: 12, color: '#aaa', textAlign: 'center', marginTop: 16 }}>
            생성된 모임은 관리자 승인 후 활성화됩니다.
          </p>
        </div>
      </div>
    );
  }

  // ─── 기본 정보 화면 (step 0) ───
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f7f7f8' }}>
      <Navbar />
      <main style={{ maxWidth: 560, margin: '40px auto', padding: '0 20px 60px' }}>
        <div style={{ backgroundColor: 'white', borderRadius: 16, padding: 32, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 24, color: '#111' }}>
            {isEdit ? '모임 수정' : '모임 만들기'}
          </h1>

          <form
            onSubmit={isEdit ? handleEditSubmit : (e) => { e.preventDefault(); handleBasicNext(); }}
            style={{ display: 'flex', flexDirection: 'column', gap: 18 }}
          >
            {/* 카테고리 (생성 시만) */}
            {!isEdit && (
              <div>
                <label style={labelStyle}>카테고리</label>
                {categories.length === 0 ? (
                  <p style={{ fontSize: 13, color: '#aaa' }}>카테고리를 불러오는 중...</p>
                ) : (
                  <select
                    value={form.categoryId}
                    onChange={e => setForm(prev => ({ ...prev, categoryId: Number(e.target.value) }))}
                    style={inputStyle}
                    required
                  >
                    {categories.map(cat => (
                      <option key={cat.categoryId} value={cat.categoryId}>{cat.categoryName}</option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {/* 모임 이름 */}
            <div>
              <label style={labelStyle}>모임 이름 <span style={{ color: '#aaa', fontWeight: 400 }}>(최대 20자)</span></label>
              <input
                type="text"
                value={form.name}
                maxLength={20}
                onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                style={inputStyle}
                placeholder="모임 이름을 입력하세요"
                required
              />
            </div>

            {/* 설명 */}
            <div>
              <label style={labelStyle}>소개 <span style={{ color: '#aaa', fontWeight: 400 }}>(최대 255자)</span></label>
              <textarea
                value={form.description}
                maxLength={255}
                onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                style={{ ...inputStyle, resize: 'vertical' }}
                placeholder="모임을 소개해주세요"
              />
            </div>

            {/* 대표 이미지 */}
            <div>
              <label style={labelStyle}>
                대표 이미지 <span style={{ color: '#aaa', fontWeight: 400 }}>(선택, 최대 10MB)</span>
              </label>
              {(previewUrl || existingImageUrl) && (
                <img
                  src={previewUrl || existingImageUrl}
                  alt="대표 이미지 미리보기"
                  style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 8, marginBottom: 8 }}
                />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ ...inputStyle, padding: '8px 12px', cursor: 'pointer' }}
              />
            </div>

            {/* 최대 인원 */}
            <div>
              <label style={labelStyle}>
                최대 인원{' '}
                <span style={{ color: '#aaa', fontWeight: 400 }}>
                  {isEdit ? `(최소 ${Math.max(10, currentMember)}명, 최대 250명)` : '(최소 10명, 최대 250명)'}
                </span>
              </label>
              <input
                type="number"
                value={form.maxMember}
                min={isEdit ? Math.max(10, currentMember) : 10}
                max={250}
                onChange={e => setForm(prev => ({ ...prev, maxMember: Number(e.target.value) }))}
                style={inputStyle}
                required
              />
            </div>

            {error && (
              <p style={{ fontSize: 13, color: '#dc2626', padding: '8px 12px', backgroundColor: '#fef2f2', borderRadius: 8 }}>
                {error}
              </p>
            )}

            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button
                type="button"
                onClick={() => navigate(-1)}
                style={{ ...btnStyle, flex: 1, background: 'white', color: '#666', border: '1px solid #e5e5e5' }}
              >
                취소
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{ ...btnStyle, flex: 2, background: '#111', color: 'white', opacity: loading ? 0.6 : 1 }}
              >
                {loading ? '처리 중...' : isEdit ? '수정하기' : '다음'}
              </button>
            </div>

            {isEdit && (
              <p style={{ fontSize: 12, color: '#aaa', textAlign: 'center' }}>
                모임 이름·설명·최대 인원·대표 이미지만 수정할 수 있습니다.
              </p>
            )}
          </form>
        </div>
      </main>
      <Footer />
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

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 6,
};
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px', border: '1px solid #e5e5e5', borderRadius: 8,
  fontSize: 14, color: '#111', boxSizing: 'border-box', outline: 'none',
};
const btnStyle: React.CSSProperties = {
  padding: '12px 0', borderRadius: 8, border: 'none', fontSize: 14,
  fontWeight: 600, cursor: 'pointer', transition: 'opacity 0.15s',
};
