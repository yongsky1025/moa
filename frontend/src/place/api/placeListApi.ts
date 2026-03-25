import api from "../../users/utils/jwtUtil";
import type { PlaceListResponse, PlaceSearchParams } from "../types/placeTypes";

export const fetchPlaces = (params: PlaceSearchParams): Promise<PlaceListResponse> =>
  api
    .get<PlaceListResponse>("/api/places/all-place", { params })
    .then((res) => res.data);
