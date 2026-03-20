import type { PageResultDTO, SanctionFilterDTO, SanctionResponseDTO, ReportTargetType, SanctionType, SanctionState } from '../types/adminTypes';
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchSanctionList } from '../api/adminReportAndSanctionApi';

const DEFAULT_SIZE = 20;

function paramsToDTO(sp: URLSearchParams): SanctionFilterDTO {
  return {
    page: Number(sp.get('page')) || 1,
    size: Number(sp.get('size')) || DEFAULT_SIZE,
    type: sp.get('type') || undefined,
    keyword: sp.get('keyword') || undefined,
    targetType: (sp.get('targetType') ?? undefined) as ReportTargetType | undefined,
    sanctionType: (sp.get('sanctionType') ?? undefined) as SanctionType | undefined,
    sanctionState: (sp.get('sanctionState') ?? undefined) as SanctionState | undefined,
  };
}

function dtoToParams(dto: SanctionFilterDTO): Record<string, string> {
  const r: Record<string, string> = {};
  if (dto.page > 1) r.page = String(dto.page);
  if (dto.size && dto.size !== DEFAULT_SIZE) r.size = String(dto.size);
  if (dto.type) r.type = dto.type;
  if (dto.keyword) r.keyword = dto.keyword;
  if (dto.targetType) r.targetType = dto.targetType;
  if (dto.sanctionType) r.sanctionType = dto.sanctionType;
  if (dto.sanctionState) r.sanctionState = dto.sanctionState;
  return r;
}

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
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState<PageResultDTO<SanctionResponseDTO> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const params = paramsToDTO(searchParams);

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

  useEffect(() => { load(paramsToDTO(searchParams)); }, [searchParams, load]);

  const applyFilter = useCallback((partial: Partial<SanctionFilterDTO>) => {
    const next = { ...params, ...partial, page: 1 };
    setSearchParams(dtoToParams(next), { replace: true });
  }, [params, setSearchParams]);

  const handlePageChange = useCallback(({ selected }: { selected: number }) => {
    const next = { ...params, page: selected + 1 };
    setSearchParams(dtoToParams(next), { replace: true });
  }, [params, setSearchParams]);

  const refresh = useCallback(() => load(params), [load, params]);

  const actualTotalPage = data ? Math.ceil((data.totalCount ?? 0) / (params.size ?? DEFAULT_SIZE)) : 0;

  return (
    <AdminSanctionsContext.Provider
      value={{ params, data, loading, error, actualTotalPage, applyFilter, handlePageChange, refresh }}
    >
      {children}
    </AdminSanctionsContext.Provider>
  );
}

export function useAdminSanctions() {
  return useContext(AdminSanctionsContext)!;
}
