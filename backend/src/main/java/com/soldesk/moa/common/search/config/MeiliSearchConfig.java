package com.soldesk.moa.common.search.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.soldesk.moa.common.search.HttpMeiliSearchOperations;
import com.soldesk.moa.common.search.MeiliSearchOperations;
import com.soldesk.moa.common.search.NoOpMeiliSearchOperations;

@Configuration
@EnableConfigurationProperties(MeiliSearchProperties.class)
public class MeiliSearchConfig {

    @Bean
    @Qualifier("meiliSearchMasterRestClient")
    @ConditionalOnProperty(prefix = "meilisearch", name = "enabled", havingValue = "true")
    public RestClient meiliSearchMasterRestClient(MeiliSearchProperties properties) {
        if (!StringUtils.hasText(properties.getHost())) {
            throw new IllegalStateException("[#SEARCH] meilisearch.host 설정이 필요합니다.");
        }
        return buildRestClient(properties.getHost(), resolveMasterApiKey(properties));
    }

    @Bean
    @Qualifier("meiliSearchSearchRestClient")
    @ConditionalOnProperty(prefix = "meilisearch", name = "enabled", havingValue = "true")
    public RestClient meiliSearchSearchRestClient(MeiliSearchProperties properties) {
        if (!StringUtils.hasText(properties.getHost())) {
            throw new IllegalStateException("[#SEARCH] meilisearch.host 설정이 필요합니다.");
        }
        return buildRestClient(properties.getHost(), resolveSearchApiKey(properties));
    }

    private RestClient buildRestClient(String host, String apiKey) {
        RestClient.Builder builder = RestClient.builder()
                .baseUrl(host.trim());

        if (StringUtils.hasText(apiKey)) {
            builder.defaultHeader("Authorization", "Bearer " + apiKey.trim());
        }

        return builder.build();
    }

    private String resolveMasterApiKey(MeiliSearchProperties properties) {
        if (StringUtils.hasText(properties.getMasterApiKey())) {
            return properties.getMasterApiKey();
        }
        throw new IllegalStateException("[#SEARCH] meilisearch.master-api-key 설정이 필요합니다.");
    }

    private String resolveSearchApiKey(MeiliSearchProperties properties) {
        if (StringUtils.hasText(properties.getSearchApiKey())) {
            return properties.getSearchApiKey();
        }
        throw new IllegalStateException("[#SEARCH] meilisearch.search-api-key 설정이 필요합니다.");
    }

    @Bean
    @ConditionalOnProperty(prefix = "meilisearch", name = "enabled", havingValue = "true")
    public MeiliSearchOperations meiliSearchOperations(
            @Qualifier("meiliSearchMasterRestClient") RestClient meiliSearchMasterRestClient,
            @Qualifier("meiliSearchSearchRestClient") RestClient meiliSearchSearchRestClient,
            ObjectMapper objectMapper) {
        return new HttpMeiliSearchOperations(
                meiliSearchMasterRestClient,
                meiliSearchSearchRestClient,
                objectMapper);
    }

    @Bean
    @ConditionalOnMissingBean(MeiliSearchOperations.class)
    public MeiliSearchOperations noOpMeiliSearchOperations() {
        return new NoOpMeiliSearchOperations();
    }
}
