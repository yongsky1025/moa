import type { AdminCircleSearchDTO, AdminCircleResponseDTO, PageResultDTO } from '../types/adminTypes';
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { fetchCircleList } from '../api/adminCircleApi';

const initialParams: AdminCircleSearchDTO = {
  page: 1,
  size: 5,
  type: undefined,
  keyword: undefined,
  status: undefined,
  categoryName: undefined,
};

interface AdminCirclesContextValue {
  params: AdminCircleSearchDTO;
  data: PageResultDTO<AdminCircleResponseDTO> | null;
  loading: boolean;
  error: string | null;
  actualTotalPage: number;
  applyFilter: (partial: Partial<AdminCircleSearchDTO>) => void;
  handlePageChange: (e: { selected: number }) => void;
  refresh: () => void;
}

const AdminCirclesContext = createContext<AdminCirclesContextValue | null>(null);

export function AdminCirclesProvider({ children }: { children: ReactNode }) {
  const [params, setParams] = useState<AdminCircleSearchDTO>(initialParams);
  const [data, setData] = useState<PageResultDTO<AdminCircleResponseDTO> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (dto: AdminCircleSearchDTO) => {
    setLoading(true);
    setError(null);
    try {
      setData(await fetchCircleList(dto));
    } catch {
      setError('모임 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(params); }, [params, load]);

  const applyFilter = useCallback((partial: Partial<AdminCircleSearchDTO>) => {
    setParams((prev) => ({ ...prev, ...partial, page: 1 }));
  }, []);

  const handlePageChange = useCallback(({ selected }: { selected: number }) => {
    setParams((prev) => ({ ...prev, page: selected + 1 }));
  }, []);

  const refresh = useCallback(() => load(params), [load, params]);

  const actualTotalPage = data ? Math.ceil((data.totalCount ?? 0) / (params.size ?? 5)) : 0;

  return (
    <AdminCirclesContext.Provider
      value={{ params, data, loading, error, actualTotalPage, applyFilter, handlePageChange, refresh }}
    >
      {children}
    </AdminCirclesContext.Provider>
  );
}

export function useAdminCircles() {
  return useContext(AdminCirclesContext)!;
}
