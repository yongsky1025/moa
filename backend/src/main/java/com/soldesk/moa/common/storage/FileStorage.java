package com.soldesk.moa.common.storage;

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
}
