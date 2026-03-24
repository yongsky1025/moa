import type { AdminCircleSearchDTO, AdminCircleResponseDTO, PageResultDTO, CircleStatus } from '../types/adminTypes';
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchCircleList } from '../api/adminCircleApi';
import { usePageSize } from '../hooks/usePageSize';

function paramsToDTO(sp: URLSearchParams, pageSize: number): AdminCircleSearchDTO {
  return {
    page: Number(sp.get('page')) || 1,
    size: pageSize,
    type: sp.get('type') || undefined,
    keyword: sp.get('keyword') || undefined,
    status: (sp.get('status') as CircleStatus) || undefined,
    categoryName: sp.get('categoryName') || undefined,
  };
}

function dtoToParams(dto: AdminCircleSearchDTO): Record<string, string> {
  const r: Record<string, string> = {};
  if (dto.page > 1) r.page = String(dto.page);
  if (dto.type) r.type = dto.type;
  if (dto.keyword) r.keyword = dto.keyword;
  if (dto.status) r.status = dto.status;
  if (dto.categoryName) r.categoryName = dto.categoryName;
  return r;
}

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
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState<PageResultDTO<AdminCircleResponseDTO> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pageSize = usePageSize();

  const params = paramsToDTO(searchParams, pageSize);

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

  useEffect(() => { load(paramsToDTO(searchParams, pageSize)); }, [searchParams, pageSize, load]);

  const applyFilter = useCallback((partial: Partial<AdminCircleSearchDTO>) => {
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
