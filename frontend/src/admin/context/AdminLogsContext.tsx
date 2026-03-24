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
import { fetchAllLogs } from '../api/adminLogApi';

const PAGE_SIZE = 30;

interface LogsContextType {
  logs: AdminActionLog[];
  totalCount: number;
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
  refresh: () => void;
}

const AdminLogsContext = createContext<LogsContextType | null>(null);

export function AdminLogsProvider({ children }: { children: ReactNode }) {
  const [logs, setLogs] = useState<AdminActionLog[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const pageRef = useRef(1);

  const load = useCallback(async (page: number, append: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAllLogs({ page, size: PAGE_SIZE });
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

  // 최초 로드
  useEffect(() => {
    pageRef.current = 1;
    load(1, false);
  }, [load]);

  const loadMore = useCallback(() => {
    if (loading || !hasMore) return;
    const next = pageRef.current + 1;
    pageRef.current = next;
    load(next, true);
  }, [loading, hasMore, load]);

  const refresh = useCallback(() => {
    pageRef.current = 1;
    setLogs([]);
    setHasMore(true);
    load(1, false);
  }, [load]);

  return (
    <AdminLogsContext.Provider
      value={{ logs, totalCount, loading, error, hasMore, loadMore, refresh }}
    >
      {children}
    </AdminLogsContext.Provider>
  );
}

export function useAdminLogs() {
  return useContext(AdminLogsContext)!;
}
