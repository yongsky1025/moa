import api from "../../users/utils/jwtUtil";
import { requestUploadUrl, uploadByContract } from "../../api/uploadUrlApi";
import type { MyPlaceReviewDTO, PendingReviewDTO } from "../types/placeTypes";

const BASE = "/api/place-reviews";

export interface ReviewCreateRequest {
  rating: number;
  comment: string;
  imagePaths?: string[];
}

export interface ReviewUpdateRequest {
  rating: number;
  comment: string;
  imagePaths?: string[];
}

/** 후기 작성 */
export const createReview = (
  reservationId: number,
  data: ReviewCreateRequest,
): Promise<number> =>
  api.post<number>(`${BASE}/${reservationId}`, data).then((res) => res.data);

/** 후기 수정 */
export const updateReview = (
  reviewId: number,
  data: ReviewUpdateRequest,
): Promise<void> =>
  api.put(`${BASE}/${reviewId}`, data).then(() => undefined);

/** 후기 삭제 */
export const deleteReview = (reviewId: number): Promise<void> =>
  api.delete(`${BASE}/${reviewId}`).then(() => undefined);

/** 마이페이지 - 내가 쓴 후기 */
export const fetchMyReviews = (): Promise<MyPlaceReviewDTO[]> =>
  api.get<MyPlaceReviewDTO[]>(`${BASE}/my`).then((res) => res.data);

/** 마이페이지 - 작성 가능한 후기 */
export const fetchPendingReviews = (): Promise<PendingReviewDTO[]> =>
  api.get<PendingReviewDTO[]>(`${BASE}/my/pending`).then((res) => res.data);

/** 후기 이미지 1장 업로드 → path 반환 */
export const uploadReviewImage = async (file: File): Promise<string> => {
  const metadata = await requestUploadUrl({
    domain: "PLACE_REVIEW",
    fileName: file.name,
    contentType: file.type || "image/jpeg",
  });
  await uploadByContract(metadata, file);
  // fileUrl: "http://localhost:8080/uploads/..." → "/uploads/..."
  const idx = metadata.fileUrl.indexOf("/uploads/");
  return idx >= 0 ? metadata.fileUrl.substring(idx) : metadata.fileUrl;
};
