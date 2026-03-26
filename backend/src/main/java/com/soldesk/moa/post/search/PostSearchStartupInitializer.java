package com.soldesk.moa.post.search;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

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
        postDomainSearchSupport.ensureConfigured();
        log.info("[#SEARCH] Meilisearch posts 인덱스 초기화 완료");
    }
}
