import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchCircleMembers } from '../../api/adminCircleApi';
import type { AdminCircleMemberDTO } from '../../types/adminTypes';

const formatDate = (date: string | null) => {
  if (!date) return '-';
  const d = new Date(date);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
};

const ROLE_MAP: Record<string, { label: string; cls: string }> = {
  LEADER: { label: '리더', cls: 'bg-moa-primary text-white' },
  MEMBER: { label: '멤버', cls: 'bg-moa-light text-moa-secondary' },
};

const GENDER_MAP: Record<string, { label: string; cls: string }> = {
  MALE:        { label: '♂ 남성', cls: 'bg-blue-50 text-blue-500' },
  FEMALE:      { label: '♀ 여성', cls: 'bg-pink-50 text-pink-500' },
  UNSPECIFIED: { label: '미설정', cls: 'bg-gray-100 text-gray-500' },
};

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  ACTIVE:  { label: '활동중', cls: 'bg-emerald-50 text-emerald-600' },
  PENDING: { label: '승인대기', cls: 'bg-amber-50 text-amber-600' },
};

export default function AdminCircleMemberList({ circleId }: { circleId: number }) {
  const navigate = useNavigate();
  const [members, setMembers] = useState<AdminCircleMemberDTO[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchCircleMembers(circleId, { page: 1, size: 9999 });
      setMembers(data.dtoList);
      setTotalCount(data.totalCount);
    } catch { /* ignore */ }
    setLoading(false);
  }, [circleId]);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <div className="border-moa-border flex items-center justify-between border-b px-4 py-3">
        <span className="text-moa-subtle text-xs font-semibold">
          총 <span className="text-moa-primary font-bold">{totalCount}</span>명
        </span>
      </div>

      <div className="max-h-160 overflow-y-auto overscroll-y-contain">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10 bg-white">
            <tr className="border-moa-border border-b">
              {['이름', '성별', '역할', '상태', '가입일'].map((h, i) => (
                <th key={i} className="text-moa-subtle px-4 py-3 text-left text-xs font-semibold whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-moa-border divide-y">
            {loading && Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="animate-pulse">
                {Array.from({ length: 5 }).map((__, j) => (
                  <td key={j} className="px-4 py-3"><div className="bg-moa-border h-4 rounded-full" style={{ width: '70%' }} /></td>
                ))}
              </tr>
            ))}

            {!loading && members.length === 0 && (
              <tr>
                <td colSpan={5} className="text-moa-subtle px-4 py-10 text-center text-sm">가입한 회원이 없습니다.</td>
              </tr>
            )}

            {!loading && members.map((m) => {
              const role = ROLE_MAP[m.role] ?? { label: m.role, cls: 'bg-gray-100 text-gray-500' };
              const gender = GENDER_MAP[m.gender] ?? GENDER_MAP.UNSPECIFIED;
              const status = STATUS_MAP[m.status] ?? { label: m.status, cls: 'bg-gray-100 text-gray-500' };

              return (
                <tr key={m.userId} className={`transition-colors ${m.role === 'LEADER' ? 'bg-moa-light/40' : 'hover:bg-moa-light/20'}`}>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => navigate(`/admin/users/profile/${m.userId}`)}
                      className="flex cursor-pointer items-center gap-2 transition-colors hover:opacity-80"
                    >
                      <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        m.role === 'LEADER' ? 'bg-moa-primary text-white' : 'bg-moa-border text-moa-secondary'
                      }`}>
                        {m.userName.charAt(0)}
                      </div>
                      <span className="text-moa-primary font-semibold whitespace-nowrap underline-offset-2 hover:underline">{m.userName}</span>
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${gender.cls}`}>
                      {gender.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${role.cls}`}>
                      {role.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${status.cls}`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="text-moa-subtle px-4 py-3 font-mono text-xs">{formatDate(m.joinDate)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
