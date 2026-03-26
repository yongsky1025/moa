import type {
  AdminPlaceSearchDTO,
  AdminPlaceResponseDTO,
  AdminPlaceDetailDTO,
  ClosedDayDTO,
  PageResultDTO,
  PlaceCreateRequest,
} from "../types/adminTypes";
import { API_SERVER_HOST_ADMIN } from "./adminDashboardApi";
import api from "../../api/axiosInstance";
export { fetchTagsGrouped } from "../../place/api/placeRentalApi";

// ── 이미지 업로드 ────────────────────────────────────────

interface UploadUrlResponse {
  uploadUrl: string;
  fileUrl: string;
  key: string;
  method: string;
}

/** 업로드 URL + TEMP 레코드 생성 */
export const requestUploadUrl = async (
  fileName: string,
  contentType: string,
  domain = "PLACE",
): Promise<UploadUrlResponse> => {
  const res = await api.post<UploadUrlResponse>(
    `${API_SERVER_HOST_ADMIN}/images/upload-url`,
    { domain, fileName, contentType },
  );
  return res.data;
};

/** 실제 파일 업로드 (multipart)
 *  uploadUrl 에 이미 key 쿼리 파라미터가 포함되어 있으므로 formData 에는 file 만 담는다.
 */
export const uploadImageFile = async (
  uploadUrl: string,
  file: File,
): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await api.post<{ fileUrl: string }>(uploadUrl, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  // fileUrl은 절대 URL(http://localhost:8080/uploads/...) → 경로만 추출
  const fileUrl = res.data.fileUrl;
  const idx = fileUrl.indexOf("/uploads/");
  return idx >= 0 ? fileUrl.substring(idx) : fileUrl;
};

// 장소 등록
export const registerPlace = async (dto: PlaceCreateRequest) => {
  const res = await api.post<number>(
    `${API_SERVER_HOST_ADMIN}/places/register`,
    dto,
  );
  return res.data;
};

// 장소 목록 조회 (검색/필터/정렬)
export const fetchAdminPlaces = async (dto: AdminPlaceSearchDTO) => {
  const res = await api.get<PageResultDTO<AdminPlaceResponseDTO>>(
    `${API_SERVER_HOST_ADMIN}/places/list`,
    { params: dto },
  );
  return res.data;
};

// 장소 단건 조회 (수정 페이지용)
export const fetchAdminPlace = async (id: number) => {
  const res = await api.get<AdminPlaceDetailDTO>(
    `${API_SERVER_HOST_ADMIN}/places/${id}`,
  );
  return res.data;
};

// 장소 수정
export const updatePlace = async (id: number, dto: PlaceCreateRequest) => {
  const res = await api.put<number>(
    `${API_SERVER_HOST_ADMIN}/places/${id}`,
    dto,
  );
  return res.data;
};

// 장소 삭제 (소프트)
export const deletePlace = async (id: number) => {
  await api.delete(`${API_SERVER_HOST_ADMIN}/places/${id}`);
};

// ── 특정 휴무일 관리 ──

// 특정 휴무일 목록 조회
export const fetchClosedDays = async (placeId: number) => {
  const res = await api.get<ClosedDayDTO[]>(
    `${API_SERVER_HOST_ADMIN}/places/${placeId}/closed-days`,
  );
  return res.data;
};

// 특정 휴무일 추가
export const addClosedDay = async (
  placeId: number,
  date: string,
  reason: string,
) => {
  const res = await api.post<ClosedDayDTO>(
    `${API_SERVER_HOST_ADMIN}/places/${placeId}/closed-days`,
    { date, reason },
  );
  return res.data;
};

// 특정 휴무일 삭제
export const removeClosedDay = async (placeId: number, closedDayId: number) => {
  await api.delete(
    `${API_SERVER_HOST_ADMIN}/places/${placeId}/closed-days/${closedDayId}`,
  );
};
