import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { AdminActionLog, LogSearchDTO, PageResultDTO } from '../types/adminTypes';
import { fetchUserLogs } from '../api/adminLogApi';

const initialParams: LogSearchDTO = { page: 1, size: 30 };

interface UserLogsContextType {
  logs: AdminActionLog[];
  totalCount: number;
  actualTotalPage: number;
  current: number;
  loading: boolean;
  error: string | null;
  params: LogSearchDTO;
  userId: number | null;
  setUserId: (id: number) => void;
  clearUserId: () => void;
  handlePageChange: (e: { selected: number }) => void;
  refresh: () => void;
}

const AdminUserLogsContext = createContext<UserLogsContextType | null>(null);

export function AdminUserLogsProvider({ children }: { children: ReactNode }) {
  const [userId, setUserIdState] = useState<number | null>(null);
  const [params, setParams] = useState<LogSearchDTO>(initialParams);
  const [data, setData] = useState<PageResultDTO<AdminActionLog> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (uid: number, dto: LogSearchDTO) => {
    setLoading(true);
    setError(null);
    try {
      setData(await fetchUserLogs(uid, dto));
    } catch (e: any) {
      setError(e?.response?.data?.message ?? '로그를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (userId !== null) load(userId, params);
  }, [userId, params, load]);

  const setUserId = useCallback((id: number) => {
    setUserIdState(id);
    setParams(initialParams);
    setData(null);
  }, []);

  const clearUserId = useCallback(() => {
    setUserIdState(null);
    setParams(initialParams);
    setData(null);
    setError(null);
  }, []);

  const handlePageChange = useCallback(({ selected }: { selected: number }) => {
    setParams((prev) => ({ ...prev, page: selected + 1 }));
  }, []);

  const refresh = useCallback(() => {
    if (userId !== null) load(userId, params);
  }, [load, userId, params]);

  const actualTotalPage = data ? Math.ceil(data.totalCount / params.size) : 0;

  return (
    <AdminUserLogsContext.Provider
      value={{
        logs: data?.dtoList ?? [],
        totalCount: data?.totalCount ?? 0,
        actualTotalPage,
        current: data?.current ?? 1,
        loading,
        error,
        params,
        userId,
        setUserId,
        clearUserId,
        handlePageChange,
        refresh,
      }}
    >
      {children}
    </AdminUserLogsContext.Provider>
  );
}

export function useAdminUserLogs() {
  return useContext(AdminUserLogsContext)!;
}
