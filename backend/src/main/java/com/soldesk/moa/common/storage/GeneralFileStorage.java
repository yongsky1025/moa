package com.soldesk.moa.common.storage;

import com.soldesk.moa.common.storage.dto.CreateUploadUrlResponseDTO;

public interface GeneralFileStorage {

    CreateUploadUrlResponseDTO createUploadUrl(String domain, String fileName, String contentType);

    void delete(String key);
}
