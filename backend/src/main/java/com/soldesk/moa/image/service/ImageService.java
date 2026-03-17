package com.soldesk.moa.image.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import com.soldesk.moa.board.common.exception.BadRequestException;
import com.soldesk.moa.board.common.exception.NotFoundException;
import com.soldesk.moa.board.post.repository.PostImageRepository;
import com.soldesk.moa.image.dto.ImageTempUploadResponseDTO;
import com.soldesk.moa.image.entity.Image;
import com.soldesk.moa.image.repository.ImageRepository;
import com.soldesk.moa.image.service.ImageStorageService.StoredImageFile;
import com.soldesk.moa.users.entity.Users;
import com.soldesk.moa.users.repository.UsersRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ImageService {

    private final ImageRepository imageRepository;
    private final UsersRepository usersRepository;
    private final PostImageRepository postImageRepository;
    private final ImageStorageService imageStorageService;

    @Transactional
    public ImageTempUploadResponseDTO uploadTempImage(Long userId, MultipartFile file, String tempKey, Long ord) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("empty file");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new BadRequestException("only image upload is allowed");
        }

        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("user not found"));

        String effectiveTempKey = StringUtils.hasText(tempKey) ? tempKey : UUID.randomUUID().toString();
        long effectiveOrd = (ord != null) ? ord : resolveNextOrd(userId, effectiveTempKey);
        StoredImageFile storedFile = imageStorageService.storePostImage(file);

        Image image = Image.builder()
                .name(storedFile.originalName())
                .uuid(storedFile.storedName())
                .path(storedFile.imageUrl())
                .extension(storedFile.extension())
                .mimeType(storedFile.mimeType())
                .fileSize(storedFile.fileSize())
                .ord(effectiveOrd)
                .user(user)
                .tempKey(effectiveTempKey)
                .temporary(true)
                .uploadedAt(LocalDateTime.now())
                .build();

        Image saved = imageRepository.save(image);
        return ImageTempUploadResponseDTO.builder()
                .imageId(saved.getImageId())
                .tempKey(effectiveTempKey)
                .imageUrl(saved.getPath())
                .ord(saved.getOrd())
                .build();
    }

    public List<ImageTempUploadResponseDTO> listTempImages(Long userId, String tempKey) {
        if (!StringUtils.hasText(tempKey)) {
            throw new BadRequestException("tempKey is required");
        }

        return imageRepository.findByUser_UserIdAndTempKeyOrderByOrdAscImageIdAsc(userId, tempKey)
                .stream()
                .filter(Image::isTemporary)
                .map(image -> ImageTempUploadResponseDTO.builder()
                        .imageId(image.getImageId())
                        .tempKey(image.getTempKey())
                        .imageUrl(image.getPath())
                        .ord(image.getOrd())
                        .build())
                .toList();
    }

    @Transactional
    public void deleteTempImage(Long userId, Long imageId, String tempKey) {
        if (!StringUtils.hasText(tempKey)) {
            throw new BadRequestException("tempKey is required");
        }

        Image image = imageRepository.findByImageIdAndUser_UserIdAndTempKey(imageId, userId, tempKey)
                .orElseThrow(() -> new NotFoundException("temp image not found"));

        if (!image.isTemporary() || postImageRepository.existsByImage_ImageId(image.getImageId())) {
            throw new BadRequestException("already bound image");
        }

        imageStorageService.deletePostImage(image.getPath());
        imageRepository.delete(image);
    }

    private long resolveNextOrd(Long userId, String tempKey) {
        Long maxOrd = imageRepository.findMaxOrdByUserAndTempKey(userId, tempKey);
        return (maxOrd == null ? -1L : maxOrd) + 1L;
    }
}
