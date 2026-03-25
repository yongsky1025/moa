import { useCallback, useEffect, useState } from 'react';
import { fetchCirclePosts } from '../../api/adminCircleApi';
import type { AdminCirclePostDTO } from '../../types/adminTypes';

const formatDate = (date: string | null) => {
  if (!date) return '-';
  const d = new Date(date);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
};

export default function AdminCirclePostList({ circleId }: { circleId: number }) {
  const [posts, setPosts] = useState<AdminCirclePostDTO[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchCirclePosts(circleId, { page: 1, size: 10 });
      setPosts(data.dtoList);
    } catch { /* ignore */ }
    setLoading(false);
  }, [circleId]);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <div className="border-moa-border flex items-center justify-between border-b px-4 py-3">
        <span className="text-moa-subtle text-xs font-semibold">최근 10개</span>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-moa-border border-b">
            {['제목', '작성자', '조회수', '댓글', '작성일'].map((h, i) => (
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

          {!loading && posts.length === 0 && (
            <tr>
              <td colSpan={5} className="text-moa-subtle px-4 py-10 text-center text-sm">게시물이 없습니다.</td>
            </tr>
          )}

          {!loading && posts.map((p) => (
            <tr key={p.postId} className="transition-colors hover:bg-moa-light/20">
              <td className="px-4 py-3">
                <span className="text-moa-text font-medium">{p.title}</span>
              </td>
              <td className="text-moa-secondary whitespace-nowrap px-4 py-3">{p.authorName}</td>
              <td className="text-moa-subtle whitespace-nowrap px-4 py-3 font-mono text-xs">{p.viewCount}</td>
              <td className="whitespace-nowrap px-4 py-3">
                <span className="text-moa-primary text-xs font-semibold">{p.replyCount}</span>
              </td>
              <td className="text-moa-subtle whitespace-nowrap px-4 py-3 font-mono text-xs">{formatDate(p.createDate)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
