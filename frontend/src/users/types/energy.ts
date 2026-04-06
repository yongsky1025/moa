import type { RecommendationItem } from "../../circle/types/circle";

export interface EnergyRecommendationItem extends RecommendationItem {
  starRating: number;
  matchReason: string;
}
