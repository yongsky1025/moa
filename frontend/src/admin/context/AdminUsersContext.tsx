import type {
  AdminUserResponseDTO,
  AdminUserSearchDTO,
  PageResultDTO,
} from '../types/adminTypes';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { fetchAdminUserList } from '../api/adminUserApi';

const initialParams: AdminUserSearchDTO = {
  page: 1,
  size: 20,
  name: undefined,
  gender: undefined,
  status: undefined,
  role: undefined,
};

interface UserListContextType {
  users: AdminUserResponseDTO[];
  totalCount: number;
  totalPage: number;
  current: number;
  loading: boolean;
  error: string | null;
  params: AdminUserSearchDTO;
  applyFilter: (partial: Partial<AdminUserSearchDTO>) => void;
  handlePageChange: (e: { selected: number }) => void;
  refresh: () => void;
}

// context+provider
// context 생성
const AdminUsersContext = createContext<UserListContextType | null>(null);

export function AdminUsersProvider({ children }: { children: ReactNode }) {
  const [params, setParams] = useState<AdminUserSearchDTO>(initialParams);
  const [data, setData] = useState<PageResultDTO<AdminUserResponseDTO> | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    load(params);
  }, [params, load]);

  const applyFilter = useCallback((partial: Partial<AdminUserSearchDTO>) => {
    setParams((prev) => ({ ...prev, ...partial, page: 1 }));
  }, []);

  // pagenate -1했던거 복구
  const handlePageChange = useCallback(({ selected }: { selected: number }) => {
    setParams((prev) => ({ ...prev, page: selected + 1 }));
  }, []);

  const refresh = useCallback(() => {
    load(params);
  }, [load, params]);

  return (
    <AdminUsersContext.Provider
      value={{
        users: data?.dtoList ?? [],
        totalCount: data?.totalCount ?? 0,
        totalPage: data?.totalPage ?? 0,
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
