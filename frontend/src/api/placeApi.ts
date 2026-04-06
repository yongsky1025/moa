import api from './axiosInstance';

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
  representativeImagePath: string | null;
}

export interface PopularPlaceItem {
  placeId: number;
  name: string;
  city: string;
  averageRating: number;
  imageUrl: string | null;
  tags: string[];
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
    api.get<PlaceRecommendResponse[]>('/api/places/recommend', {
      params: { title, description, tags, lat, lng, topN },
    }),

  getPopularPlaces: () =>
    api.get<PopularPlaceItem[]>('/api/places/popular'),

  togglePlaceLike: (placeId: number) =>
    api.post<{ targetType: string; targetId: number; liked: boolean; likeCount: number }>(
      `/api/likes/places/PLACE/${placeId}`,
    ),
};
