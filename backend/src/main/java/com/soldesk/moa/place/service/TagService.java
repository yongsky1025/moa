package com.soldesk.moa.place.service;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.soldesk.moa.place.dto.TagCategoryGroupDTO;
import com.soldesk.moa.place.dto.TagResponseDTO;
import com.soldesk.moa.place.dto.TagSuggestRequestDTO;
import com.soldesk.moa.place.dto.TagSuggestResponseDTO;
import com.soldesk.moa.place.entity.Tag;
import com.soldesk.moa.place.entity.TagCategory;
import com.soldesk.moa.place.repository.TagCategoryRepository;
import com.soldesk.moa.place.repository.TagRepository;

import lombok.RequiredArgsConstructor;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class TagService {

    private final TagRepository tagRepository;
    private final TagCategoryRepository tagCategoryRepository;
    private final EmbeddingModel embeddingModel;

    // 카테고리별로 그룹핑된 태그 목록 조회 (scheduleOnly=true면 일정용 카테고리만)
    public List<TagCategoryGroupDTO> getTagsGroupedByCategory(boolean scheduleOnly) {
        List<TagCategory> categories = tagCategoryRepository.findAll();

        return categories.stream()
                .filter(TagCategory::getIsActive)
                .filter(c -> !scheduleOnly || Boolean.TRUE.equals(c.getScheduleEnabled()))
                .sorted((a, b) -> {
                    if (a.getSortOrder() == null) return 1;
                    if (b.getSortOrder() == null) return -1;
                    return a.getSortOrder().compareTo(b.getSortOrder());
                })
                .map(category -> {
                    List<TagResponseDTO> tags = tagRepository
                            .findByTagCategoryAndIsActiveTrueOrderByNameAsc(category)
                            .stream()
                            .map(tag -> TagResponseDTO.builder()
                                    .id(tag.getId())
                                    .name(tag.getName())
                                    .build())
                            .toList();

                    return TagCategoryGroupDTO.builder()
                            .categoryId(category.getId())
                            .categoryName(category.getName())
                            .tags(tags)
                            .build();
                })
                .toList();
    }

    // 제목+설명 임베딩 기반 일정용 태그 추천 (상위 N개)
    public List<TagSuggestResponseDTO> suggestTags(TagSuggestRequestDTO req, int topN) {
        String query = List.of(
                req.title() != null ? req.title().trim() : "",
                req.description() != null ? req.description().trim() : "")
                .stream().filter(s -> !s.isBlank())
                .collect(Collectors.joining(". "));

        if (query.isBlank()) return List.of();

        // 일정용 카테고리의 활성 태그만 대상
        List<Tag> tags = tagCategoryRepository.findAll().stream()
                .filter(TagCategory::getIsActive)
                .filter(c -> Boolean.TRUE.equals(c.getScheduleEnabled()))
                .flatMap(c -> tagRepository.findByTagCategoryAndIsActiveTrueOrderByNameAsc(c).stream())
                .toList();

        if (tags.isEmpty()) return List.of();

        // 태그 텍스트: "카테고리명 - 태그명" 형태로 컨텍스트 제공
        List<String> tagTexts = tags.stream()
                .map(t -> t.getTagCategory().getName() + " - " + t.getName())
                .toList();

        float[] queryEmb = embeddingModel.embed(query);
        List<float[]> tagEmbs = embeddingModel.embed(tagTexts);

        record Scored(Tag tag, double score) {}

        return IntStream.range(0, tags.size())
                .mapToObj(i -> new Scored(tags.get(i), cosineSimilarity(queryEmb, tagEmbs.get(i))))
                .filter(s -> s.score() > 0.30)
                .sorted(Comparator.comparingDouble(Scored::score).reversed())
                .limit(topN)
                .map(s -> new TagSuggestResponseDTO(
                        s.tag().getId(),
                        s.tag().getName(),
                        s.tag().getTagCategory().getName()))
                .toList();
    }

    private double cosineSimilarity(float[] a, float[] b) {
        double dot = 0, normA = 0, normB = 0;
        for (int i = 0; i < a.length; i++) {
            dot += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }
        return normA == 0 || normB == 0 ? 0 : dot / (Math.sqrt(normA) * Math.sqrt(normB));
    }
}
