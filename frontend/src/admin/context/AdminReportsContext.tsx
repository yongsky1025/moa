import type { ReportFilterDTO, ReportResponseDTO, PageResultDTO } from '../types/adminTypes';
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { fetchReportList } from '../api/adminReportAndSanctionApi';

const initialParams: ReportFilterDTO = {
  page: 1,
  size: 20,
  type: undefined,
  keyword: undefined,
  status: undefined,
  targetType: undefined,
  category: undefined,
};

interface AdminReportsContextValue {
  params: ReportFilterDTO;
  data: PageResultDTO<ReportResponseDTO> | null;
  loading: boolean;
  error: string | null;
  actualTotalPage: number;
  applyFilter: (partial: Partial<ReportFilterDTO>) => void;
  handlePageChange: (e: { selected: number }) => void;
  refresh: () => void;
}

const AdminReportsContext = createContext<AdminReportsContextValue | null>(null);

export function AdminReportsProvider({ children }: { children: ReactNode }) {
  const [params, setParams] = useState<ReportFilterDTO>(initialParams);
  const [data, setData] = useState<PageResultDTO<ReportResponseDTO> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (dto: ReportFilterDTO) => {
    setLoading(true);
    setError(null);
    try {
      setData(await fetchReportList(dto));
    } catch (e: any) {
      setError(e?.response?.data?.message ?? '신고 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(params);
  }, [params, load]);

  const applyFilter = useCallback((partial: Partial<ReportFilterDTO>) => {
    setParams((prev) => ({ ...prev, ...partial, page: 1 }));
  }, []);

  const handlePageChange = useCallback(({ selected }: { selected: number }) => {
    setParams((prev) => ({ ...prev, page: selected + 1 }));
  }, []);

  const refresh = useCallback(() => load(params), [load, params]);

  const actualTotalPage = data ? Math.ceil((data.totalCount ?? 0) / (params.size ?? 20)) : 0;

  return (
    <AdminReportsContext.Provider
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
    </AdminReportsContext.Provider>
  );
}

export function useAdminReports() {
  return useContext(AdminReportsContext)!;
}

