package com.soldesk.moa.post.search;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Component
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "meilisearch", name = "enabled", havingValue = "true")
@Log4j2
public class PostSearchStartupInitializer implements ApplicationRunner {

    private final PostDomainSearchSupport postDomainSearchSupport;

    @Override
    public void run(ApplicationArguments args) {
        if (!postDomainSearchSupport.enabled()) {
            log.info("[#SEARCH] meilisearch.enabled=false, 인덱스 초기화를 건너뜁니다.");
            return;
        }

        try {
            postDomainSearchSupport.ensureConfigured();
            log.info("[#SEARCH] Meilisearch posts 인덱스 초기화 완료");
        } catch (RestClientException | IllegalStateException e) {
            log.warn("[#SEARCH] Meilisearch 초기화 실패, 애플리케이션은 계속 기동합니다. message={}", e.getMessage());
        }
    }
}
