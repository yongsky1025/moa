package com.soldesk.moa.common.storage;

import java.io.IOException;

import org.springframework.web.multipart.MultipartFile;

import com.soldesk.moa.common.storage.dto.CreateUploadUrlResponseDTO;

public interface FileStorage {

    /**
     * 업로드 URL/키/메서드 메타데이터를 생성한다.
     *
     * <p>
     * 구현체(Local/S3)는 domain/fileName/contentType을 해석해 업로드 위치를 결정한다.
     * 컨트롤러/서비스는 구현체 종류를 몰라야 하며, 응답 계약(uploadUrl/fileUrl/key/method)만 의존한다.
     * </p>
     *
     * <p>
     * TODO(S3): presigned POST form field/headers가 필요하면 응답 DTO를 확장한다.
     * </p>
     */
    CreateUploadUrlResponseDTO createUploadUrl(String domain, String fileName, String contentType);

    /**
     * 저장소 키 기준 삭제.
     *
     * <p>
     * TODO(S3): object versioning/lifecycle 정책과 충돌하지 않도록 구현체별 삭제 정책 확정 필요.
     * </p>
     */
    void delete(String key);

    /**
     * key 경로에 파일을 저장한다.
     *
     * <p>
     * 기본 구현은 미지원이며, 로컬 스토리지처럼 서버에서 직접 파일 저장이 필요한 구현체에서 override 한다.
     * </p>
     */
    default void store(String key, MultipartFile file) throws IOException {
        throw new UnsupportedOperationException("현재 저장소는 서버 직접 업로드를 지원하지 않습니다.");
    }
}
