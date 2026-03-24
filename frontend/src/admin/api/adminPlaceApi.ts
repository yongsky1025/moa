import axios from "axios";
import type {
  AdminPlaceSearchDTO,
  AdminPlaceResponseDTO,
  AdminPlaceDetailDTO,
  ClosedDayDTO,
  PageResultDTO,
  TagCategoryGroupDTO,
  PlaceCreateRequest,
} from "../types/adminTypes";
import { API_SERVER_HOST_ADMIN } from "./adminDashboardApi";

const API_HOST = "http://localhost:8080/api";

// 태그 카테고리별 그룹핑 조회
export const fetchTagsGrouped = async () => {
  const res = await axios.get<TagCategoryGroupDTO[]>(
    `${API_HOST}/tags/grouped`,
  );
  return res.data;
};

// 장소 등록
export const registerPlace = async (dto: PlaceCreateRequest) => {
  const res = await axios.post<number>(
    `${API_SERVER_HOST_ADMIN}/places/register`,
    dto,
  );
  return res.data;
};

// 장소 목록 조회 (검색/필터/정렬)
export const fetchAdminPlaces = async (dto: AdminPlaceSearchDTO) => {
  const res = await axios.get<PageResultDTO<AdminPlaceResponseDTO>>(
    `${API_SERVER_HOST_ADMIN}/places/list`,
    { params: dto },
  );
  return res.data;
};

// 장소 단건 조회 (수정 페이지용)
export const fetchAdminPlace = async (id: number) => {
  const res = await axios.get<AdminPlaceDetailDTO>(
    `${API_SERVER_HOST_ADMIN}/places/${id}`,
  );
  return res.data;
};

// 장소 수정
export const updatePlace = async (id: number, dto: PlaceCreateRequest) => {
  const res = await axios.put<number>(
    `${API_SERVER_HOST_ADMIN}/places/${id}`,
    dto,
  );
  return res.data;
};

// 장소 삭제 (소프트)
export const deletePlace = async (id: number) => {
  await axios.delete(`${API_SERVER_HOST_ADMIN}/places/${id}`);
};

// ── 특정 휴무일 관리 ──

// 특정 휴무일 목록 조회
export const fetchClosedDays = async (placeId: number) => {
  const res = await axios.get<ClosedDayDTO[]>(
    `${API_SERVER_HOST_ADMIN}/places/${placeId}/closed-days`,
  );
  return res.data;
};

// 특정 휴무일 추가
export const addClosedDay = async (placeId: number, date: string, reason: string) => {
  const res = await axios.post<ClosedDayDTO>(
    `${API_SERVER_HOST_ADMIN}/places/${placeId}/closed-days`,
    { date, reason },
  );
  return res.data;
};

// 특정 휴무일 삭제
export const removeClosedDay = async (placeId: number, closedDayId: number) => {
  await axios.delete(
    `${API_SERVER_HOST_ADMIN}/places/${placeId}/closed-days/${closedDayId}`,
  );
};
