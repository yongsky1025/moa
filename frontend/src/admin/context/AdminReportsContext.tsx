import type { ReportFilterDTO, ReportResponseDTO, PageResultDTO, ReportStatus, ReportTargetType, ReportCategory } from '../types/adminTypes';
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchReportList } from '../api/adminReportAndSanctionApi';
import { usePageSize } from '../hooks/usePageSize';

function paramsToDTO(sp: URLSearchParams, pageSize: number): ReportFilterDTO {
  return {
    page: Number(sp.get('page')) || 1,
    size: pageSize,
    type: sp.get('type') || undefined,
    keyword: sp.get('keyword') || undefined,
    status: (sp.get('status') ?? undefined) as ReportStatus | undefined,
    targetType: (sp.get('targetType') ?? undefined) as ReportTargetType | undefined,
    category: (sp.get('category') ?? undefined) as ReportCategory | undefined,
  };
}

function dtoToParams(dto: ReportFilterDTO): Record<string, string> {
  const r: Record<string, string> = {};
  if (dto.page > 1) r.page = String(dto.page);
  if (dto.type) r.type = dto.type;
  if (dto.keyword) r.keyword = dto.keyword;
  if (dto.status) r.status = dto.status;
  if (dto.targetType) r.targetType = dto.targetType;
  if (dto.category) r.category = dto.category;
  return r;
}

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
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState<PageResultDTO<ReportResponseDTO> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pageSize = usePageSize();

  const params = paramsToDTO(searchParams, pageSize);

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

  useEffect(() => { load(paramsToDTO(searchParams, pageSize)); }, [searchParams, pageSize, load]);

  const applyFilter = useCallback((partial: Partial<ReportFilterDTO>) => {
    const next = { ...params, ...partial, page: 1 };
    setSearchParams(dtoToParams(next), { replace: true });
  }, [params, setSearchParams]);

  const handlePageChange = useCallback(({ selected }: { selected: number }) => {
    const next = { ...params, page: selected + 1 };
    setSearchParams(dtoToParams(next), { replace: true });
  }, [params, setSearchParams]);

  const refresh = useCallback(() => load(params), [load, params]);

  const actualTotalPage = data ? Math.ceil((data.totalCount ?? 0) / (params.size ?? pageSize)) : 0;

  return (
    <AdminReportsContext.Provider
      value={{ params, data, loading, error, actualTotalPage, applyFilter, handlePageChange, refresh }}
    >
      {children}
    </AdminReportsContext.Provider>
  );
}

export function useAdminReports() {
  return useContext(AdminReportsContext)!;
}
