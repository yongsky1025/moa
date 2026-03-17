import { useNavigate } from 'react-router-dom';
import { useAdminUserList } from '../../context/AdminUsersContext';
import MoaPaginate from '../Moapaginate';
import AdminRoleBadge from './AdminRolebadge';
import AdminStatusBadge from './AdminStatusbadge';

const formatDate = (date: string | null) => {
  if (!date) return '-';
  const d = new Date(date);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
};

const HEADERS = [
  'No.',
  '이름',
  '나이',
  '생년월일',
  '성별',
  '상태',
  '권한',
  '가입일',
  '',
];

function AdminUserTable() {
  const navigate = useNavigate();
  const {
    users,
    totalCount,
    totalPage,
    current,
    params,
    loading,
    error,
    handlePageChange,
  } = useAdminUserList();

  return (
    <div className="border-moa-border overflow-hidden rounded-2xl border bg-white shadow-sm">
      {/* 에러 배너 */}
      {error && (
        <div className="flex items-center gap-3 border-b border-red-100 bg-red-50 px-6 py-4 text-sm text-red-700">
          <svg
            className="h-4 w-4 shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-moa-primary">
              {HEADERS.map((h, i) => (
                <th
                  key={i}
                  className="px-5 py-3.5 text-left text-xs font-bold tracking-wider whitespace-nowrap text-white uppercase opacity-90"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-moa-border divide-y">
            {/* 로딩 스켈레톤 */}
            {loading &&
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {Array.from({ length: 9 }).map((__, j) => (
                    <td key={j} className="px-5 py-4">
                      <div
                        className="bg-moa-border h-4 rounded-full"
                        style={{ width: `${60 + ((j * 17) % 40)}%` }}
                      />
                    </td>
                  ))}
                </tr>
              ))}

            {/* 빈 결과 */}
            {!loading && users.length === 0 && (
              <tr>
                <td colSpan={9} className="px-5 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="bg-moa-light flex h-16 w-16 items-center justify-center rounded-2xl">
                      <svg
                        className="text-moa-muted h-8 w-8"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                    <span className="text-moa-subtle text-sm">
                      조건에 맞는 유저가 없습니다.
                    </span>
                  </div>
                </td>
              </tr>
            )}

            {/* 데이터 행 */}
            {!loading &&
              users.map((user, idx) => {
                const no =
                  totalCount - (current - 1) * (params.size ?? 20) - idx;
                const isAdmin = user.role === 'ADMIN';

                return (
                  <tr
                    key={user.userId}
                    onClick={() => navigate(`/admin/users/${user.userId}`)}
                    className={`group cursor-pointer transition-colors ${isAdmin ? 'bg-moa-light/40 hover:bg-moa-light' : 'hover:bg-moa-light/30'}`}
                  >
                    <td className="text-moa-subtle px-5 py-3.5 font-mono text-xs">
                      {no}
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${isAdmin ? 'bg-moa-primary text-white' : 'bg-moa-border text-moa-secondary'}`}
                        >
                          {user.name.charAt(0)}
                        </div>
                        <span className="text-moa-text group-hover:text-moa-primary font-semibold whitespace-nowrap transition-colors">
                          {user.name}
                        </span>
                        <AdminRoleBadge role={user.role} />
                      </div>
                    </td>

                    <td className="text-moa-secondary px-5 py-3.5 whitespace-nowrap">
                      {user.age}세
                    </td>

                    <td className="text-moa-secondary px-5 py-3.5 font-mono text-xs whitespace-nowrap">
                      {user.birth?.replace(/-/g, '.') ?? '—'}
                    </td>

                    <td className="px-5 py-3.5 whitespace-nowrap">
                      {user.gender === 'MALE' ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-500">
                          ♂ 남성
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-pink-50 px-2 py-0.5 text-xs font-semibold text-pink-500">
                          ♀ 여성
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-3.5">
                      <AdminStatusBadge status={user.status} />
                    </td>

                    <td className="px-5 py-3.5 text-xs whitespace-nowrap">
                      {isAdmin ? (
                        <span className="text-moa-primary font-bold">
                          관리자
                        </span>
                      ) : (
                        <span className="text-moa-subtle">일반</span>
                      )}
                    </td>

                    <td className="text-moa-subtle px-5 py-3.5 font-mono text-xs whitespace-nowrap">
                      {formatDate(user.createDate)}
                    </td>

                    <td
                      className="px-5 py-3.5 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => navigate(`/admin/users/${user.userId}`)}
                        className="bg-moa-primary hover:bg-moa-hover inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold whitespace-nowrap text-white opacity-0 transition-all group-hover:opacity-100"
                      >
                        상세보기
                        <svg
                          className="h-3 w-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      {!loading && totalPage > 1 && (
        <div className="border-moa-border flex flex-col items-center gap-3 border-t px-6 py-5">
          <MoaPaginate
            pageCount={totalPage}
            currentPage={current}
            onPageChange={handlePageChange}
          />
          <p className="text-moa-subtle text-xs">
            <span className="text-moa-secondary font-semibold">{current}</span>{' '}
            / {totalPage} 페이지 &nbsp;·&nbsp; 총{' '}
            <span className="text-moa-primary font-semibold">
              {totalCount.toLocaleString()}
            </span>
            명
          </p>
        </div>
      )}
    </div>
  );
}

export default AdminUserTable;
