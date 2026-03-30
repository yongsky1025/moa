package com.soldesk.moa.place.service;

import java.util.Comparator;
import java.util.List;
import java.util.stream.IntStream;

import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.soldesk.moa.place.dto.PlaceRecommendResponseDTO;
import com.soldesk.moa.place.entity.Place;
import com.soldesk.moa.place.entity.PlaceReview;
import com.soldesk.moa.place.repository.PlaceRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PlaceRecommendService {

        private static final double EMBEDDING_WEIGHT = 0.7;
        private static final double DISTANCE_WEIGHT = 0.3;
        private static final double MIN_SIMILARITY = 0.2; // 유사도 최소 임계값 (이하 제외)

        private final PlaceRepository placeRepository;
        private final EmbeddingModel embeddingModel;

        //
        // 일정 정보를 기반으로 장소를 추천.
        // 위치 정보가 제공되면 임베딩 유사도(70%) + 거리 점수(30%) 복합 산정,
        // 위치 정보가 없으면 임베딩 유사도만으로 랭킹.
        //
        public List<PlaceRecommendResponseDTO> recommend(
                        String title, String description, List<String> tags,
                        Double lat, Double lng, int topN) {

                String queryText = buildQueryText(title, description, tags);
                // 두 쿼리로 분리하여 MultipleBagFetchException 방지 (같은 트랜잭션 내 1차 캐시 병합)
                placeRepository.findAllWithReviews();
                List<Place> places = placeRepository.findAllWithTags();
                if (places.isEmpty())
                        return List.of();

                List<String> placeTexts = places.stream()
                                .map(this::buildPlaceText)
                                .toList();

                // 배치로 한 번에 임베딩 (API 호출 최소화)
                List<float[]> placeEmbeddings = embeddingModel.embed(placeTexts);
                float[] queryEmbedding = embeddingModel.embed(queryText);

                boolean hasLocation = lat != null && lng != null;

                return IntStream.range(0, places.size())
                                .mapToObj(i -> {
                                        Place p = places.get(i);
                                        double similarity = cosineSimilarity(queryEmbedding, placeEmbeddings.get(i));
                                        Double distanceKm = hasLocation
                                                        ? haversineDistance(lat, lng, p.getLatitude(), p.getLongitude())
                                                        : null;
                                        double score = hasLocation
                                                        ? EMBEDDING_WEIGHT * similarity
                                                                        + DISTANCE_WEIGHT * (1.0 / (1.0 + distanceKm))
                                                        : similarity;

                                        List<String> tagNames = p.getTags().stream()
                                                        .map(pt -> pt.getTag().getName())
                                                        .toList();

                                        return new PlaceRecommendResponseDTO(
                                                        p.getId(), p.getName(), p.getAddress(),
                                                        p.getCity(), p.getDistrict(),
                                                        p.getLatitude(), p.getLongitude(),
                                                        p.getCapacity(), p.getPricePerHour(),
                                                        tagNames, similarity, distanceKm, score);
                                })
                                .filter(dto -> dto.similarity() >= MIN_SIMILARITY)
                                .sorted(Comparator.comparingDouble(PlaceRecommendResponseDTO::score).reversed())
                                .limit(topN)
                                .toList();
        }

        private String buildQueryText(String title, String description, List<String> tags) {
                StringBuilder sb = new StringBuilder();
                if (title != null)
                        sb.append(title).append(". ");
                if (description != null)
                        sb.append(description).append(". ");
                if (tags != null && !tags.isEmpty())
                        sb.append("태그: ").append(String.join(", ", tags));
                return sb.toString().trim();
        }

        private String buildPlaceText(Place place) {
                String tagNames = place.getTags().stream()
                                .map(pt -> pt.getTag().getName())
                                .collect(java.util.stream.Collectors.joining(", "));
                String reviews = place.getReviews().stream()
                                .map(PlaceReview::getComment)
                                .limit(10)
                                .collect(java.util.stream.Collectors.joining(". "));
                return String.format("장소명: %s. 설명: %s. 태그: %s. 리뷰: %s",
                                place.getName(), place.getDescription(), tagNames, reviews);
        }

        private double cosineSimilarity(float[] a, float[] b) {
                double dot = 0, normA = 0, normB = 0;
                for (int i = 0; i < a.length; i++) {
                        dot += a[i] * b[i];
                        normA += a[i] * a[i];
                        normB += b[i] * b[i];
                }
                if (normA == 0 || normB == 0)
                        return 0;
                return dot / (Math.sqrt(normA) * Math.sqrt(normB));
        }

        private double haversineDistance(double lat1, double lng1, double lat2, double lng2) {
                final double R = 6371;
                double dLat = Math.toRadians(lat2 - lat1);
                double dLng = Math.toRadians(lng2 - lng1);
                double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                                                * Math.sin(dLng / 2) * Math.sin(dLng / 2);
                return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        }
}
