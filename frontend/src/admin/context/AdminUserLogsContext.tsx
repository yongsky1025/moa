import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { AdminActionLog } from '../types/adminTypes';
import { fetchUserLogs } from '../api/adminLogApi';

const PAGE_SIZE = 30;

interface UserLogsContextType {
  logs: AdminActionLog[];
  totalCount: number;
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  userId: number | null;
  setUserId: (id: number) => void;
  clearUserId: () => void;
  loadMore: () => void;
  refresh: () => void;
}

const AdminUserLogsContext = createContext<UserLogsContextType | null>(null);

export function AdminUserLogsProvider({ children }: { children: ReactNode }) {
  const [userId, setUserIdState] = useState<number | null>(null);
  const [logs, setLogs] = useState<AdminActionLog[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const pageRef = useRef(1);

  const load = useCallback(async (uid: number, page: number, append: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchUserLogs(uid, { page, size: PAGE_SIZE });
      const newItems = data.dtoList ?? [];
      setLogs(prev => append ? [...prev, ...newItems] : newItems);
      setTotalCount(data.totalCount ?? 0);

      const totalPages = Math.ceil((data.totalCount ?? 0) / PAGE_SIZE);
      setHasMore(page < totalPages);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? '로그를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  // userId 변경 시 첫 페이지 로드
  useEffect(() => {
    if (userId === null) return;
    pageRef.current = 1;
    setLogs([]);
    setHasMore(false);
    load(userId, 1, false);
  }, [userId, load]);

  const setUserId = useCallback((id: number) => {
    setUserIdState(id);
  }, []);

  const clearUserId = useCallback(() => {
    setUserIdState(null);
    setLogs([]);
    setTotalCount(0);
    setError(null);
    setHasMore(false);
  }, []);

  const loadMore = useCallback(() => {
    if (loading || !hasMore || userId === null) return;
    const next = pageRef.current + 1;
    pageRef.current = next;
    load(userId, next, true);
  }, [loading, hasMore, userId, load]);

  const refresh = useCallback(() => {
    if (userId === null) return;
    pageRef.current = 1;
    setLogs([]);
    setHasMore(true);
    load(userId, 1, false);
  }, [userId, load]);

  return (
    <AdminUserLogsContext.Provider
      value={{
        logs, totalCount, loading, error, hasMore,
        userId, setUserId, clearUserId, loadMore, refresh,
      }}
    >
      {children}
    </AdminUserLogsContext.Provider>
  );
}

export function useAdminUserLogs() {
  return useContext(AdminUserLogsContext)!;
}
