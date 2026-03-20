import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { AdminActionLog, LogSearchDTO, PageResultDTO } from '../types/adminTypes';
import { fetchAllLogs } from '../api/adminLogApi';

const initialParams: LogSearchDTO = { page: 1, size: 30 };

interface LogsContextType {
  logs: AdminActionLog[];
  totalCount: number;
  actualTotalPage: number;
  current: number;
  loading: boolean;
  error: string | null;
  params: LogSearchDTO;
  handlePageChange: (e: { selected: number }) => void;
  refresh: () => void;
}

const AdminLogsContext = createContext<LogsContextType | null>(null);

export function AdminLogsProvider({ children }: { children: ReactNode }) {
  const [params, setParams] = useState<LogSearchDTO>(initialParams);
  const [data, setData] = useState<PageResultDTO<AdminActionLog> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (dto: LogSearchDTO) => {
    setLoading(true);
    setError(null);
    try {
      setData(await fetchAllLogs(dto));
    } catch (e: any) {
      setError(e?.response?.data?.message ?? '로그를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(params);
  }, [params, load]);

  const handlePageChange = useCallback(({ selected }: { selected: number }) => {
    setParams((prev) => ({ ...prev, page: selected + 1 }));
  }, []);

  const refresh = useCallback(() => {
    load(params);
  }, [load, params]);

  const actualTotalPage = data ? Math.ceil(data.totalCount / params.size) : 0;

  return (
    <AdminLogsContext.Provider
      value={{
        logs: data?.dtoList ?? [],
        totalCount: data?.totalCount ?? 0,
        actualTotalPage,
        current: data?.current ?? 1,
        loading,
        error,
        params,
        handlePageChange,
        refresh,
      }}
    >
      {children}
    </AdminLogsContext.Provider>
  );
}

export function useAdminLogs() {
  return useContext(AdminLogsContext)!;
}
