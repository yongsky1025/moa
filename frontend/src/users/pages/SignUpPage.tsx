import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { FcGoogle } from 'react-icons/fc';
import { RiKakaoTalkFill } from 'react-icons/ri';
import { SiNaver } from 'react-icons/si';
import { signup } from '../reducers/authSlice';
import type { AppDispatch } from '../reducers/store';

export default function SignUpPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: '',
    name: '',
    nickname: '',
    password: '',
    birthDate: '',
    userGender: 'MALE' as 'MALE' | 'FEMALE',
  });
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    if (!privacyAgreed) {
      setError('개인정보 수집 및 이용에 동의해주세요.');
      setLoading(false);
      return;
    }
    const result = await dispatch(
      signup({ ...form, age: 0, privacyAgreed: true }),
    );
    setLoading(false);
    if (signup.fulfilled.match(result)) {
      alert('회원가입 성공! 로그인 해주세요.');
      navigate('/users/login');
    } else {
      setError((result.payload as string) || '회원가입 실패');
    }
  };

  const set =
    (key: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSocialSignup = (provider: 'google' | 'kakao' | 'naver') => {
    window.location.href = `/oauth2/authorization/${provider}`;
  };

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
        {/* 로고 */}
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
            함께하는 모임, 더 즐거운 일상
          </p>
        </div>

        {/* 카드 */}
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: 16,
            padding: '32px 28px',
            boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
          }}
        >
          {/* 소셜 회원가입 섹션 */}
          <div>
            <p
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: '#555',
                marginBottom: 12,
                textAlign: 'center',
              }}
            >
              소셜 계정으로 시작하기
            </p>

            {/* 구글 */}
            <button
              onClick={() => handleSocialSignup('google')}
              style={{
                width: '100%',
                height: 48,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                backgroundColor: 'white',
                border: '1.5px solid #e0e0e0',
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 600,
                color: '#3c4043',
                cursor: 'pointer',
                marginBottom: 10,
              }}
            >
              <FcGoogle style={{ width: 20, height: 20 }} />
              구글로 시작하기
            </button>

            {/* 카카오 */}
            <button
              onClick={() => handleSocialSignup('kakao')}
              style={{
                width: '100%',
                height: 48,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                backgroundColor: '#FEE500',
                border: 'none',
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 600,
                color: '#191919',
                cursor: 'pointer',
                marginBottom: 10,
              }}
            >
              <RiKakaoTalkFill
                style={{ width: 20, height: 20, color: '#191919' }}
              />
              카카오로 시작하기
            </button>

            {/* 네이버 */}
            <button
              onClick={() => handleSocialSignup('naver')}
              style={{
                width: '100%',
                height: 48,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                backgroundColor: '#03C75A',
                border: 'none',
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 600,
                color: 'white',
                cursor: 'pointer',
              }}
            >
              <SiNaver style={{ width: 16, height: 16, color: 'white' }} />
              네이버로 시작하기
            </button>
          </div>

          {/* 구분선 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              margin: '24px 0',
            }}
          >
            <div style={{ flex: 1, height: 1, backgroundColor: '#ebebeb' }} />
            <span style={{ fontSize: 12, color: '#bbb', fontWeight: 500 }}>
              또는
            </span>
            <div style={{ flex: 1, height: 1, backgroundColor: '#ebebeb' }} />
          </div>

          {/* 이메일 회원가입 폼 */}
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input
                type="email"
                placeholder="이메일"
                value={form.email}
                onChange={set('email')}
                required
                style={inputStyle}
              />
              <input
                type="text"
                placeholder="이름 (2~5자 한글)"
                value={form.name}
                onChange={set('name')}
                required
                style={inputStyle}
              />
              <input
                type="text"
                placeholder="닉네임 (2~10자)"
                value={form.nickname}
                onChange={set('nickname')}
                required
                style={inputStyle}
              />
              <input
                type="password"
                placeholder="비밀번호 (8~20자, 영문+숫자+특수문자)"
                value={form.password}
                onChange={set('password')}
                required
                style={inputStyle}
              />
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
              <select
                value={form.userGender}
                onChange={set('userGender')}
                style={inputStyle}
              >
                <option value="MALE">남성</option>
                <option value="FEMALE">여성</option>
              </select>
            </div>

            {/* 개인정보 동의 */}
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

            {/* 에러 메시지 */}
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
                marginTop: 16,
                backgroundColor: loading ? '#555' : '#111',
                color: 'white',
                border: 'none',
                borderRadius: 12,
                fontSize: 15,
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? '처리 중...' : '회원가입'}
            </button>
          </form>

          {/* 하단 링크 */}
          <div style={{ marginTop: 20, textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: '#888', margin: 0 }}>
              이미 계정이 있으신가요?{' '}
              <Link
                to="/users/login"
                style={{
                  color: '#111',
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                로그인
              </Link>
            </p>
          </div>
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
