package com.soldesk.moa.common.config;

import java.nio.file.Paths;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${upload.path}")
    private String uploadPath;

    @Value("${app.local-upload-dir}")
    private String localUploadDir;

    @Value("${app.local-image-upload-dir}")
    private String localImageUploadDir;

    @Value("${app.local-file-upload-dir}")
    private String localFileUploadDir;

    // /images/** 요청을 uploadPath 폴더의 실제 파일로 연결
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/images/**")
                .addResourceLocations("file:///" + uploadPath + "/");

        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(
                        Paths.get(localImageUploadDir).toUri().toString(),
                        Paths.get(localFileUploadDir).toUri().toString(),
                        Paths.get(localUploadDir).toUri().toString());
    }
}
