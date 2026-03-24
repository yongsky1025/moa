package com.soldesk.moa.place.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.soldesk.moa.place.dto.TagCategoryGroupDTO;
import com.soldesk.moa.place.service.TagService;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/tags")
@Tag(name = "Tag(place & schedule) section", description = "Response MOA API")
public class TagController {

    private final TagService tagService;

    // 카테고리별 그룹핑된 태그 전체 조회
    @GetMapping("/grouped")
    public List<TagCategoryGroupDTO> getTagsGrouped() {
        return tagService.getTagsGroupedByCategory();
    }
}
