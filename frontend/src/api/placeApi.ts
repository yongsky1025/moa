import api from '../users/utils/jwtUtil';

export interface TagItem {
  id: number;
  name: string;
}

export interface TagCategoryGroup {
  categoryId: number;
  categoryName: string;
  tags: TagItem[];
}

export interface PlaceRecommendResponse {
  id: number;
  name: string;
  address: string;
  city: string;
  district: string;
  latitude: number;
  longitude: number;
  capacity: number;
  pricePerHour: number;
  tags: string[];
  similarity: number;
  distanceKm: number | null;
  score: number;
}

export const placeApi = {
  getTagsGrouped: () =>
    api.get<TagCategoryGroup[]>('/api/tags/grouped'),

  recommendPlaces: (
    title: string,
    description?: string,
    tags?: string[],
    lat?: number,
    lng?: number,
    topN = 5,
  ) =>
    api.get<PlaceRecommendResponse[]>('/api/place/recommend', {
      params: { title, description, tags, lat, lng, topN },
    }),
};
