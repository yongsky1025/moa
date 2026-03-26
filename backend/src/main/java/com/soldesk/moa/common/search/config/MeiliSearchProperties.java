package com.soldesk.moa.common.search.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@ConfigurationProperties(prefix = "meilisearch")
public class MeiliSearchProperties {

    private boolean enabled = false;
    private String host;
    private String masterApiKey;
    private String searchApiKey;
}
