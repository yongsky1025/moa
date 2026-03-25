import api from "../../users/utils/jwtUtil";
import type { PlaceListResponse, PlaceSearchParams, TagCategoryGroupDTO } from "../types/placeTypes";

const API_SEVER_HOST_PLACE = "api/places"

export const fetchPlaces = (params: PlaceSearchParams): Promise<PlaceListResponse> =>
  api
    .get<PlaceListResponse>(`${API_SEVER_HOST_PLACE}/all-place`, { params })
    .then((res) => res.data);

export const fetchTagsGrouped = async (): Promise<TagCategoryGroupDTO[]> => {
  const res = await api.get<TagCategoryGroupDTO[]>(`${API_SEVER_HOST_PLACE}/tags/grouped`);
  return res.data;
};
