package com.soldesk.moa.chat.controller;

import com.soldesk.moa.auth.dto.AuthUserDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/chat/files")
@RequiredArgsConstructor
public class FileUploadController {

    @Value("${file.upload-dir}")
    private String uploadDir;

    /**
     * 파일 업로드 후 URL 반환.
     * 클라이언트는 반환된 fileUrl을 채팅 메시지 content로 전송.
     */
    @PostMapping
    public ResponseEntity<Map<String, String>> upload(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal AuthUserDTO user) throws IOException {

        String ext = getExtension(file.getOriginalFilename());
        String fileName = UUID.randomUUID() + ext;

        Path dir = Paths.get(uploadDir);
        Files.createDirectories(dir);
        file.transferTo(dir.resolve(fileName));

        String fileUrl = "/api/chat/files/" + fileName;
        return ResponseEntity.ok(Map.of("fileUrl", fileUrl));
    }

    /** 파일 다운로드 */
    @GetMapping("/{fileName}")
    public ResponseEntity<byte[]> download(@PathVariable String fileName) throws IOException {
        Path filePath = Paths.get(uploadDir, fileName);
        if (!Files.exists(filePath)) {
            return ResponseEntity.notFound().build();
        }
        byte[] data = Files.readAllBytes(filePath);
        String contentType = Files.probeContentType(filePath);
        return ResponseEntity.ok()
                .header("Content-Type", contentType != null ? contentType : "application/octet-stream")
                .header("Content-Disposition", "inline; filename=\"" + fileName + "\"")
                .body(data);
    }

    private String getExtension(String originalName) {
        if (originalName == null || !originalName.contains(".")) return "";
        return originalName.substring(originalName.lastIndexOf("."));
    }
}
