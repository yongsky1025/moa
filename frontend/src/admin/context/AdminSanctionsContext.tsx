import type { PageResultDTO, SanctionFilterDTO, SanctionResponseDTO } from '../types/adminTypes';
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { fetchSanctionList } from '../api/adminReportAndSanctionApi';

const initialParams: SanctionFilterDTO = {
  page: 1,
  size: 20,
  type: undefined,
  keyword: undefined,
  targetType: undefined,
  sanctionType: undefined,
  sanctionState: undefined,
};

interface AdminSanctionsContextValue {
  params: SanctionFilterDTO;
  data: PageResultDTO<SanctionResponseDTO> | null;
  loading: boolean;
  error: string | null;
  actualTotalPage: number;
  applyFilter: (partial: Partial<SanctionFilterDTO>) => void;
  handlePageChange: (e: { selected: number }) => void;
  refresh: () => void;
}

const AdminSanctionsContext = createContext<AdminSanctionsContextValue | null>(null);

export function AdminSanctionsProvider({ children }: { children: ReactNode }) {
  const [params, setParams] = useState<SanctionFilterDTO>(initialParams);
  const [data, setData] = useState<PageResultDTO<SanctionResponseDTO> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (dto: SanctionFilterDTO) => {
    setLoading(true);
    setError(null);
    try {
      setData(await fetchSanctionList(dto));
    } catch (e: any) {
      setError(e?.response?.data?.message ?? '제재 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(params);
  }, [params, load]);

  const applyFilter = useCallback((partial: Partial<SanctionFilterDTO>) => {
    setParams((prev) => ({ ...prev, ...partial, page: 1 }));
  }, []);

  const handlePageChange = useCallback(({ selected }: { selected: number }) => {
    setParams((prev) => ({ ...prev, page: selected + 1 }));
  }, []);

  const refresh = useCallback(() => load(params), [load, params]);

  const actualTotalPage = data ? Math.ceil((data.totalCount ?? 0) / (params.size ?? 20)) : 0;

  return (
    <AdminSanctionsContext.Provider
      value={{
        params,
        data,
        loading,
        error,
        actualTotalPage,
        applyFilter,
        handlePageChange,
        refresh,
      }}
    >
      {children}
    </AdminSanctionsContext.Provider>
  );
}

export function useAdminSanctions() {
  return useContext(AdminSanctionsContext)!;
}

