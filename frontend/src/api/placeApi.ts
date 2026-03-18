import api from '../users/utils/jwtUtil';

export interface NearbyPlace {
  id: number;
  name: string;
  address: string;
  city: string;
  district: string;
  latitude: number;
  longitude: number;
  capacity: number;
  pricePerHour: number;
  distanceKm: number;
}

export const placeApi = {
  getNearbyPlaces: (lat: number, lng: number, radius = 3.0) =>
    api.get<NearbyPlace[]>('/api/place/nearby', { params: { lat, lng, radius } }),
};
