import { useEffect, useState, type FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../common/layout/Navbar';
import Footer from '../../common/layout/Footer';
import { circleApi } from '../../api/circleApi';
import { getErrorMessage } from '../../common/utils/errorMessage';

interface Category {
  categoryId: number;
  categoryName: string;
}

export default function CircleFormPage() {
  const { circleId } = useParams<{ circleId: string }>();
  const isEdit = !!circleId;
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    description: '',
    maxMember: 10,
    categoryId: 0,
  });
  const [currentMember, setCurrentMember] = useState(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 카테고리 목록: GET /circles/categories
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

  // 수정 모드: 기존 서클 정보 로드
  useEffect(() => {
    if (!isEdit) return;
    const fetchCircle = async () => {
      try {
        const res = await circleApi.getCircle(Number(circleId));
        const c = res.data;
        setForm({
          name: c.name,
          description: c.description ?? '',
          maxMember: c.maxMember,
          categoryId: c.categoryId,
        });
        setCurrentMember(c.currentMember);
      } catch {
        setError('서클 정보를 불러올 수 없습니다.');
      }
    };
    fetchCircle();
  }, [isEdit, circleId]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!isEdit && form.categoryId === 0) {
      setError('카테고리를 선택해주세요.');
      return;
    }

    setLoading(true);
    try {
      if (isEdit) {
        await circleApi.updateCircle(Number(circleId), {
          name: form.name,
          description: form.description,
          maxMember: form.maxMember,
        });
        navigate(`/circle/${circleId}`);
      } else {
        const res = await circleApi.createCircle({
          name: form.name,
          description: form.description,
          maxMember: form.maxMember,
          categoryId: form.categoryId,
        });
        navigate(`/circle/${res.data.circleId}`);
      }
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f7f7f8' }}>
      <Navbar />
      <main style={{ maxWidth: 560, margin: '40px auto', padding: '0 20px 60px' }}>
        <div style={{ backgroundColor: 'white', borderRadius: 16, padding: 32, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 24, color: '#111' }}>
            {isEdit ? '서클 수정' : '서클 만들기'}
          </h1>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

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

            {/* 서클 이름 */}
            <div>
              <label style={labelStyle}>서클 이름 <span style={{ color: '#aaa', fontWeight: 400 }}>(최대 20자)</span></label>
              <input
                type="text"
                value={form.name}
                maxLength={20}
                onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                style={inputStyle}
                placeholder="서클 이름을 입력하세요"
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
                placeholder="서클을 소개해주세요"
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
                {loading ? '처리 중...' : isEdit ? '수정하기' : '서클 만들기'}
              </button>
            </div>

            {!isEdit && (
              <p style={{ fontSize: 12, color: '#aaa', textAlign: 'center' }}>
                생성된 서클은 관리자 승인 후 활성화됩니다.
              </p>
            )}
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}

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
