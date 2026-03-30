import type {
  AdminUserResponseDTO,
  AdminUserSearchDTO,
  PageResultDTO,
  UserGender,
  UserStatus,
  UserRole,
} from '../types/adminTypes';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchAdminUserList } from '../api/adminUserApi';
import { usePageSize } from '../hooks/usePageSize';

function paramsToDTO(sp: URLSearchParams, pageSize: number): AdminUserSearchDTO {
  return {
    page: Number(sp.get('page')) || 1,
    size: pageSize,
    keyword: sp.get('keyword') || undefined,
    type: sp.get('type') || undefined,
    gender: (sp.get('gender') ?? undefined) as UserGender | undefined,
    status: (sp.get('status') ?? undefined) as UserStatus | undefined,
    role: (sp.get('role') ?? undefined) as UserRole | undefined,
    sort: sp.get('sort') || undefined,
  };
}

function dtoToParams(dto: AdminUserSearchDTO): Record<string, string> {
  const r: Record<string, string> = {};
  if (dto.page > 1) r.page = String(dto.page);
  if (dto.keyword) r.keyword = dto.keyword;
  if (dto.type) r.type = dto.type;
  if (dto.gender) r.gender = dto.gender;
  if (dto.status) r.status = dto.status;
  if (dto.role) r.role = dto.role;
  if (dto.sort) r.sort = dto.sort;
  return r;
}

interface UserListContextType {
  users: AdminUserResponseDTO[];
  totalCount: number;
  actualTotalPage: number;
  current: number;
  loading: boolean;
  error: string | null;
  params: AdminUserSearchDTO;
  applyFilter: (partial: Partial<AdminUserSearchDTO>) => void;
  handlePageChange: (e: { selected: number }) => void;
  refresh: () => void;
}

const AdminUsersContext = createContext<UserListContextType | null>(null);

export function AdminUsersProvider({ children }: { children: ReactNode }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState<PageResultDTO<AdminUserResponseDTO> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pageSize = usePageSize();

  const params = paramsToDTO(searchParams, pageSize);

  const load = useCallback(async (dto: AdminUserSearchDTO) => {
    setLoading(true);
    setError(null);
    try {
      setData(await fetchAdminUserList(dto));
    } catch (e: any) {
      setError(
        e?.response?.data?.message ?? '유저 목록을 불러오지 못했습니다.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(paramsToDTO(searchParams, pageSize)); }, [searchParams, pageSize, load]);

  const applyFilter = useCallback((partial: Partial<AdminUserSearchDTO>) => {
    const next = { ...params, ...partial, page: 1 };
    setSearchParams(dtoToParams(next), { replace: true });
  }, [params, setSearchParams]);

  const handlePageChange = useCallback(({ selected }: { selected: number }) => {
    const next = { ...params, page: selected + 1 };
    setSearchParams(dtoToParams(next), { replace: true });
  }, [params, setSearchParams]);

  const refresh = useCallback(() => load(params), [load, params]);

  const actualTotalPage = data
    ? Math.ceil(data.totalCount / (params.size ?? pageSize))
    : 0;

  return (
    <AdminUsersContext.Provider
      value={{
        users: data?.dtoList ?? [],
        totalCount: data?.totalCount ?? 0,
        actualTotalPage,
        current: data?.current ?? 1,
        loading,
        error,
        params,
        applyFilter,
        handlePageChange,
        refresh,
      }}
    >
      {children}
    </AdminUsersContext.Provider>
  );
}

export function useAdminUserList() {
  return useContext(AdminUsersContext)!;
}
