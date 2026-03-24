package com.soldesk.moa.place.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.soldesk.moa.place.dto.TagCategoryGroupDTO;
import com.soldesk.moa.place.dto.TagResponseDTO;
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

    // 카테고리별로 그룹핑된 태그 목록 조회
    public List<TagCategoryGroupDTO> getTagsGroupedByCategory() {
        List<TagCategory> categories = tagCategoryRepository.findAll();

        return categories.stream()
                .filter(TagCategory::getIsActive)
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
}
