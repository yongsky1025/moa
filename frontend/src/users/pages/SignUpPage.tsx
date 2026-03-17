import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { signup } from '../reducers/authSlice';
import type { AppDispatch } from '../reducers/store';

function SignUpPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: '',
    name: '',
    nickname: '',
    password: '',
    birthDate: '',
    userGender: 'MALE' as 'MALE' | 'FEMALE',
    age: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await dispatch(
      signup({ ...form, age: Number(form.age) })
    );
    setLoading(false);
    if (signup.fulfilled.match(result)) {
      alert('회원가입 성공! 로그인 해주세요.');
      navigate('/user/login');
    } else {
      setError(result.payload as string || '회원가입 실패');
    }
  };

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }));

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6 text-center">회원가입</h1>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">이메일</label>
            <input type="email" value={form.email} onChange={set('email')}
              className="w-full border rounded px-3 py-2 text-sm" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">이름 (2-5자 한글)</label>
            <input type="text" value={form.name} onChange={set('name')}
              className="w-full border rounded px-3 py-2 text-sm" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">닉네임 (2-10자)</label>
            <input type="text" value={form.nickname} onChange={set('nickname')}
              className="w-full border rounded px-3 py-2 text-sm" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">비밀번호 (8-20자, 영문+숫자+특수문자)</label>
            <input type="password" value={form.password} onChange={set('password')}
              className="w-full border rounded px-3 py-2 text-sm" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">생년월일</label>
            <input type="date" value={form.birthDate} onChange={set('birthDate')}
              className="w-full border rounded px-3 py-2 text-sm" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">나이</label>
            <input type="number" value={form.age} onChange={set('age')}
              className="w-full border rounded px-3 py-2 text-sm" min="1" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">성별</label>
            <select value={form.userGender} onChange={set('userGender')}
              className="w-full border rounded px-3 py-2 text-sm">
              <option value="MALE">남성</option>
              <option value="FEMALE">여성</option>
            </select>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50">
            {loading ? '처리 중...' : '회원가입'}
          </button>
        </form>
        <p className="text-center text-sm mt-4">
          이미 계정이 있으신가요?{' '}
          <Link to="/user/login" className="text-blue-600 hover:underline">로그인</Link>
        </p>
      </div>
    </div>
  );
}

export default SignUpPage;
