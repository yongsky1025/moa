package com.soldesk.moa.place.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.soldesk.moa.place.dto.TagCategoryGroupDTO;
import com.soldesk.moa.place.dto.TagSuggestRequestDTO;
import com.soldesk.moa.place.dto.TagSuggestResponseDTO;
import com.soldesk.moa.place.service.TagService;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/tags")
@Tag(name = "Tag(place & schedule) section", description = "Response MOA API")
public class TagController {

    private final TagService tagService;

    // 카테고리별 그룹핑된 태그 조회 (scheduleEnabled=true면 일정용만)
    @GetMapping("/grouped")
    public List<TagCategoryGroupDTO> getTagsGrouped(
            @RequestParam(required = false, defaultValue = "false") boolean scheduleEnabled) {
        return tagService.getTagsGroupedByCategory(scheduleEnabled);
    }

    // 제목+설명 기반 일정 태그 추천 (임베딩 유사도 상위 8개)
    @PostMapping("/suggest")
    public List<TagSuggestResponseDTO> suggestTags(@RequestBody TagSuggestRequestDTO request) {
        return tagService.suggestTags(request, 3);
    }
}
