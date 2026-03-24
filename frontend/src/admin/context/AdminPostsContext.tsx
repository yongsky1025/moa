import type {
  AdminPostSearchDTO,
  AdminPostResponseDTO,
  PageResultDTO,
  BoardType,
} from "../types/adminTypes";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useSearchParams } from "react-router-dom";
import { fetchAdminPosts } from "../api/adminPostApi";
import { usePageSize } from "../hooks/usePageSize";

// URL 쿼리 → DTO 변환
function paramsToDTO(
  sp: URLSearchParams,
  pageSize: number,
): AdminPostSearchDTO {
  return {
    page: Number(sp.get("page")) || 1,
    size: Number(sp.get("size")) || pageSize,
    type: sp.get("type") || undefined,
    keyword: sp.get("keyword") || undefined,
    boardType: (sp.get("boardType") as BoardType) || undefined,
    deleted:
      sp.get("deleted") === "true"
        ? true
        : sp.get("deleted") === "false"
          ? false
          : undefined,
    startDate: sp.get("startDate") || undefined,
    endDate: sp.get("endDate") || undefined,
    circleId: sp.get("circleId") ? Number(sp.get("circleId")) : undefined,
    sort: sp.get("sort") || undefined,
  };
}

// DTO → URL 쿼리 변환 (undefined 값 제거)
function dtoToParams(dto: AdminPostSearchDTO): Record<string, string> {
  const result: Record<string, string> = {};
  if (dto.page > 1) result.page = String(dto.page);
  if (dto.size) result.size = String(dto.size);
  if (dto.type) result.type = dto.type;
  if (dto.keyword) result.keyword = dto.keyword;
  if (dto.boardType) result.boardType = dto.boardType;
  if (dto.deleted !== undefined) result.deleted = String(dto.deleted);
  if (dto.startDate) result.startDate = dto.startDate;
  if (dto.endDate) result.endDate = dto.endDate;
  if (dto.circleId) result.circleId = String(dto.circleId);
  if (dto.sort) result.sort = dto.sort;
  return result;
}

interface AdminPostsContextValue {
  params: AdminPostSearchDTO;
  data: PageResultDTO<AdminPostResponseDTO> | null;
  loading: boolean;
  error: string | null;
  actualTotalPage: number;
  applyFilter: (partial: Partial<AdminPostSearchDTO>) => void;
  handlePageChange: (e: { selected: number }) => void;
  refresh: () => void;
}

const AdminPostsContext = createContext<AdminPostsContextValue | null>(null);

export function AdminPostsProvider({ children }: { children: ReactNode }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const pageSize = usePageSize();

  const [data, setData] = useState<PageResultDTO<AdminPostResponseDTO> | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const params = paramsToDTO(searchParams, pageSize);

  const load = useCallback(
    async (dto: AdminPostSearchDTO) => {
      setLoading(true);
      setError(null);
      try {
        setData(await fetchAdminPosts(dto));
      } catch {
        setError("게시글 목록을 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // searchParams 변경 시 데이터 로드
  useEffect(() => {
    load(paramsToDTO(searchParams, pageSize));
  }, [searchParams, pageSize, load]);

  const applyFilter = useCallback(
    (partial: Partial<AdminPostSearchDTO>) => {
      const next = { ...params, ...partial, page: 1 };
      setSearchParams(dtoToParams(next), { replace: true });
    },
    [params, setSearchParams],
  );

  const handlePageChange = useCallback(
    ({ selected }: { selected: number }) => {
      const next = { ...params, page: selected + 1 };
      setSearchParams(dtoToParams(next), { replace: true });
    },
    [params, setSearchParams],
  );

  const refresh = useCallback(() => {
    load(params);
  }, [load, params]);

  const actualTotalPage = data
    ? Math.ceil((data.totalCount ?? 0) / (params.size || pageSize))
    : 0;

  return (
    <AdminPostsContext.Provider
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
    </AdminPostsContext.Provider>
  );
}

export function useAdminPosts() {
  return useContext(AdminPostsContext)!;
}
