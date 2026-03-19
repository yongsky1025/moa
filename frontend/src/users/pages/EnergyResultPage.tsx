import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../common/layout/Navbar';
import Footer from '../../common/layout/Footer';
import { energyProfileApi } from '../../api/energyProfileApi';
import type { EnergyProfileResponse } from '../../api/energyProfileApi';
import { getErrorMessage } from '../../common/utils/errorMessage';

export default function EnergyResultPage() {
  const navigate = useNavigate();
  const [result, setResult] = useState<EnergyProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    energyProfileApi.check()
      .then((res) => setResult(res.data))
      .catch((e) => setError(getErrorMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f7f7f8' }}>
      <Navbar />
      <main style={{ maxWidth: 480, margin: '0 auto', padding: '40px 20px 80px' }}>
        <h1 style={{ fontSize: 22, fontWeight: 900, color: '#111', marginBottom: 24 }}>
          내 에너지 결과
        </h1>

        {loading && (
          <p style={{ textAlign: 'center', color: '#888', fontSize: 14 }}>불러오는 중...</p>
        )}

        {error && (
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: 16,
              padding: '32px 28px',
              boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
              textAlign: 'center',
            }}
          >
            <p style={{ fontSize: 14, color: '#888', marginBottom: 20 }}>
              아직 에너지 프로필이 없어요.
            </p>
            <button
              onClick={() => navigate('/users/onboarding')}
              style={primaryBtnStyle}
            >
              에너지 테스트 하러 가기
            </button>
          </div>
        )}

        {!loading && result && (
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: 16,
              padding: '32px 28px',
              boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
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
              <p style={{ fontSize: 14, color: '#555', lineHeight: 1.6 }}>
                {result.energyTypeDescription}
              </p>
            </div>

            {/* 추천 카테고리 */}
            {result.recommendedCategories && (
              <div
                style={{
                  backgroundColor: '#f9f9f9',
                  borderRadius: 12,
                  padding: '16px 20px',
                  marginBottom: 20,
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

            <button
              onClick={() => navigate('/users/onboarding')}
              style={{
                ...primaryBtnStyle,
                backgroundColor: 'white',
                color: '#111',
                border: '1.5px solid #e0e0e0',
              }}
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
