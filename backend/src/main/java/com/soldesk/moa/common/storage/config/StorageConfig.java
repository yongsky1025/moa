package com.soldesk.moa.common.storage.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.context.annotation.Primary;

import com.soldesk.moa.common.storage.FileStorage;
import com.soldesk.moa.common.storage.local.LocalImageFileStorage;

@Configuration
@Profile({ "local", "prod" })
public class StorageConfig {

    // TODO(S3): prod profile에서 S3FileStorage Bean을 추가하고 FileStorage로 주입 연결한다.
    @Bean
    @Primary
    public FileStorage fileStorage(LocalImageFileStorage localImageFileStorage) {
        return localImageFileStorage;
    }
}

