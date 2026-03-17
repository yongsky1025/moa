package com.soldesk.moa.image.config;

import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class UploadResourceConfig implements WebMvcConfigurer {

    @Value("${app.upload.post-image-dir:uploads/post-images}")
    private String postImageDir;

    @Value("${app.upload.post-image-url-prefix:/images/posts}")
    private String postImageUrlPrefix;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path absolutePath = Paths.get(postImageDir).toAbsolutePath().normalize();
        String location = absolutePath.toUri().toString();

        registry.addResourceHandler(normalizePattern(postImageUrlPrefix))
                .addResourceLocations(location);
    }

    private String normalizePattern(String prefix) {
        String value = prefix;
        if (!value.startsWith("/")) {
            value = "/" + value;
        }
        if (value.endsWith("/")) {
            value = value.substring(0, value.length() - 1);
        }
        return value + "/**";
    }
}
