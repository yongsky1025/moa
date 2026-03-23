import type {
  AdminPlaceSearchDTO,
  AdminPlaceResponseDTO,
  PageResultDTO,
  PlaceStatus,
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
import { fetchAdminPlaces } from "../api/adminPlaceApi";
import { usePageSize } from "../hooks/usePageSize";

function paramsToDTO(
  sp: URLSearchParams,
  pageSize: number,
): AdminPlaceSearchDTO {
  return {
    page: Number(sp.get("page")) || 1,
    size: Number(sp.get("size")) || pageSize,
    type: sp.get("type") || undefined,
    keyword: sp.get("keyword") || undefined,
    sort: sp.get("sort") || undefined,
    city: sp.get("city") || undefined,
    district: sp.get("district") || undefined,
    status: (sp.get("status") as PlaceStatus) || undefined,
    minPrice: sp.get("minPrice") ? Number(sp.get("minPrice")) : undefined,
    maxPrice: sp.get("maxPrice") ? Number(sp.get("maxPrice")) : undefined,
    minCapacity: sp.get("minCapacity") ? Number(sp.get("minCapacity")) : undefined,
    maxCapacity: sp.get("maxCapacity") ? Number(sp.get("maxCapacity")) : undefined,
  };
}

function dtoToParams(dto: AdminPlaceSearchDTO): Record<string, string> {
  const result: Record<string, string> = {};
  if (dto.page > 1) result.page = String(dto.page);
  if (dto.size) result.size = String(dto.size);
  if (dto.type) result.type = dto.type;
  if (dto.keyword) result.keyword = dto.keyword;
  if (dto.sort) result.sort = dto.sort;
  if (dto.city) result.city = dto.city;
  if (dto.district) result.district = dto.district;
  if (dto.status) result.status = dto.status;
  if (dto.minPrice != null) result.minPrice = String(dto.minPrice);
  if (dto.maxPrice != null) result.maxPrice = String(dto.maxPrice);
  if (dto.minCapacity != null) result.minCapacity = String(dto.minCapacity);
  if (dto.maxCapacity != null) result.maxCapacity = String(dto.maxCapacity);
  return result;
}

interface AdminPlacesContextValue {
  params: AdminPlaceSearchDTO;
  data: PageResultDTO<AdminPlaceResponseDTO> | null;
  loading: boolean;
  error: string | null;
  actualTotalPage: number;
  applyFilter: (partial: Partial<AdminPlaceSearchDTO>) => void;
  handlePageChange: (e: { selected: number }) => void;
  refresh: () => void;
}

const AdminPlacesContext = createContext<AdminPlacesContextValue | null>(null);

export function AdminPlacesProvider({ children }: { children: ReactNode }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const pageSize = usePageSize();

  const [data, setData] = useState<PageResultDTO<AdminPlaceResponseDTO> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const params = paramsToDTO(searchParams, pageSize);

  const load = useCallback(
    async (dto: AdminPlaceSearchDTO) => {
      setLoading(true);
      setError(null);
      try {
        setData(await fetchAdminPlaces(dto));
      } catch {
        setError("장소 목록을 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    load(paramsToDTO(searchParams, pageSize));
  }, [searchParams, pageSize, load]);

  const applyFilter = useCallback(
    (partial: Partial<AdminPlaceSearchDTO>) => {
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
    <AdminPlacesContext.Provider
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
    </AdminPlacesContext.Provider>
  );
}

export function useAdminPlaces() {
  return useContext(AdminPlacesContext)!;
}
