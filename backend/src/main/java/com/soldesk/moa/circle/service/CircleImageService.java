package com.soldesk.moa.circle.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.soldesk.moa.common.entity.Image;
import com.soldesk.moa.common.repository.ImageRepository;
import com.soldesk.moa.users.entity.Users;
import com.soldesk.moa.users.repository.UsersRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CircleImageService {

    @Value("${upload.path}")
    private String uploadPath;

    private final ImageRepository imageRepository;
    private final UsersRepository usersRepository;

    /**
     * 서클 대표 이미지를 디스크에 저장하고 Image 엔티티를 반환
     * - post 없음 (서클 이미지이므로)
     * - user: 업로드한 사용자(서클 생성자/리더)
     */
    @Transactional
    public Image saveCoverImage(MultipartFile file, Long userId) throws IOException {
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자가 존재하지 않습니다."));

        String uuid = UUID.randomUUID().toString();
        String originalName = file.getOriginalFilename();
        String ext = originalName.substring(originalName.lastIndexOf("."));
        String saveName = uuid + ext;

        // 업로드 디렉토리 생성 후 파일 저장
        Path uploadDir = Paths.get(uploadPath);
        Files.createDirectories(uploadDir);
        file.transferTo(uploadDir.resolve(saveName).toFile());

        Image image = Image.builder()
                .name(originalName)
                .uuid(uuid)
                .path("/images/" + saveName)
                .ord(1L)
                .user(user)
                .build();

        return imageRepository.save(image);
    }
}
