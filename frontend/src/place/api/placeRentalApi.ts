import api from "../../api/axiosInstance";
import type {
  PlaceDetailDTO,
  PlaceListResponse,
  PlaceReviewDTO,
  PlaceSearchParams,
  TagCategoryGroupDTO,
} from "../types/placeTypes";

const BASE = "/api/places";

/** 배열 파라미터를 Spring이 인식하는 형식으로 직렬화 (key=a&key=b) */
function serializeParams(params: Record<string, unknown>): string {
  const sp = new URLSearchParams();
  for (const [key, val] of Object.entries(params)) {
    if (val === undefined || val === null) continue;
    if (Array.isArray(val)) {
      val.forEach((v) => sp.append(key, String(v)));
    } else {
      sp.append(key, String(val));
    }
  }
  return sp.toString();
}

export const fetchPlaces = (
  params: PlaceSearchParams,
): Promise<PlaceListResponse> =>
  api
    .get<PlaceListResponse>(`${BASE}/all-place`, {
      params,
      paramsSerializer: (p) => serializeParams(p as Record<string, unknown>),
    })
    .then((res) => res.data);

export const fetchPlaceDetail = (id: number): Promise<PlaceDetailDTO> =>
  api.get<PlaceDetailDTO>(`${BASE}/${id}`).then((res) => res.data);

export const fetchPlaceReviews = (id: number): Promise<PlaceReviewDTO[]> =>
  api.get<PlaceReviewDTO[]>(`${BASE}/${id}/reviews`).then((res) => res.data);

export const fetchTagsGrouped = async (): Promise<TagCategoryGroupDTO[]> => {
  const res = await api.get<TagCategoryGroupDTO[]>(`/api/tags/grouped`);
  return res.data;
};
