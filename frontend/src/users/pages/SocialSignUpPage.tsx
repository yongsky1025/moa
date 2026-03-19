import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setAuthFromOAuth } from '../reducers/authSlice';
import { authApi } from '../../api/authApi';
import type { AppDispatch } from '../reducers/store';

export default function SocialSignUpPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    birthDate: '',
    userGender: 'MALE' as 'MALE' | 'FEMALE',
  });
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setError('');

    if (!privacyAgreed) {
      setError('개인정보 수집 및 이용에 동의해주세요.');
      return;
    }

    setLoading(true);
    try {
      await authApi.socialSignUpComplete({
        birthDate: form.birthDate,
        userGender: form.userGender,
        privacyAgreed: true,
      });

      // 완료 후 유저 정보 갱신
      const res = await authApi.refresh();
      localStorage.setItem('accessToken', res.data.accessToken);
      dispatch(setAuthFromOAuth(res.data.user));
      navigate('/users/onboarding');
    } catch {
      setError('정보 저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const set =
    (key: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f7f7f8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
      }}
    >
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link
            to="/"
            style={{
              fontSize: 32,
              fontWeight: 900,
              color: '#111',
              textDecoration: 'none',
              letterSpacing: -1,
            }}
          >
            moa
          </Link>
          <p style={{ marginTop: 6, fontSize: 14, color: '#888' }}>
            추가 정보를 입력해주세요
          </p>
        </div>

        <div
          style={{
            backgroundColor: 'white',
            borderRadius: 16,
            padding: '32px 28px',
            boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
          }}
        >
          <p
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: '#111',
              marginBottom: 20,
              textAlign: 'center',
            }}
          >
            소셜 회원가입을 완료해주세요
          </p>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 13, color: '#555', fontWeight: 600, display: 'block', marginBottom: 6 }}>
                  생년월일 (필수)
                </label>
                <input
                  type="date"
                  value={form.birthDate}
                  onChange={set('birthDate')}
                  required
                  style={{
                    ...inputStyle,
                    color: form.birthDate ? '#111' : '#aaa',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 13, color: '#555', fontWeight: 600, display: 'block', marginBottom: 6 }}>
                  성별 (필수)
                </label>
                <select
                  value={form.userGender}
                  onChange={set('userGender')}
                  style={inputStyle}
                >
                  <option value="MALE">남성</option>
                  <option value="FEMALE">여성</option>
                </select>
              </div>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 13,
                  color: '#555',
                  cursor: 'pointer',
                  marginTop: 4,
                }}
              >
                <input
                  type="checkbox"
                  checked={privacyAgreed}
                  onChange={(e) => setPrivacyAgreed(e.target.checked)}
                  style={{ width: 16, height: 16, cursor: 'pointer' }}
                />
                개인정보 수집 및 이용에 동의합니다. (필수)
              </label>
            </div>

            {error && (
              <p
                style={{
                  fontSize: 13,
                  color: '#ff4d4f',
                  marginTop: 12,
                  textAlign: 'center',
                }}
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                height: 48,
                marginTop: 20,
                backgroundColor: loading ? '#555' : '#111',
                color: 'white',
                border: 'none',
                borderRadius: 12,
                fontSize: 15,
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? '처리 중...' : '완료'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  height: 48,
  padding: '0 14px',
  border: '1.5px solid #e0e0e0',
  borderRadius: 12,
  fontSize: 14,
  color: '#111',
  outline: 'none',
  boxSizing: 'border-box',
  backgroundColor: '#fafafa',
};
