package com.soldesk.moa.board.post.controller;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.soldesk.moa.auth.dto.AuthUserDTO;
import com.soldesk.moa.board.post.dto.PostImageUploadResponseDTO;
import com.soldesk.moa.image.dto.ImageTempUploadResponseDTO;
import com.soldesk.moa.image.service.ImageService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/post-images")
@RequiredArgsConstructor
public class PostImageRestController {
    // Backward-compatibility adapter for existing clients.

    private final ImageService imageService;

    @PreAuthorize("isAuthenticated()")
    @PostMapping("/temp")
    public PostImageUploadResponseDTO uploadTemp(
            @AuthenticationPrincipal AuthUserDTO auth,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "tempKey", required = false) String tempKey,
            @RequestParam(value = "ord", required = false) Long ord) {
        return toLegacy(imageService.uploadTempImage(auth.getUserId(), file, tempKey, ord));
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/temp")
    public List<PostImageUploadResponseDTO> listTemp(
            @AuthenticationPrincipal AuthUserDTO auth,
            @RequestParam("tempKey") String tempKey) {
        return imageService.listTempImages(auth.getUserId(), tempKey)
                .stream()
                .map(this::toLegacy)
                .toList();
    }

    @PreAuthorize("isAuthenticated()")
    @DeleteMapping("/temp/{imageId}")
    public void deleteTemp(
            @AuthenticationPrincipal AuthUserDTO auth,
            @PathVariable("imageId") Long imageId,
            @RequestParam("tempKey") String tempKey) {
        imageService.deleteTempImage(auth.getUserId(), imageId, tempKey);
    }

    private PostImageUploadResponseDTO toLegacy(ImageTempUploadResponseDTO dto) {
        return PostImageUploadResponseDTO.builder()
                .imageId(dto.getImageId())
                .tempKey(dto.getTempKey())
                .imageUrl(dto.getImageUrl())
                .ord(dto.getOrd())
                .build();
    }
}
