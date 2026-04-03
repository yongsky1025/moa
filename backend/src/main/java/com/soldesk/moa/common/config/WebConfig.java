package com.soldesk.moa.common.config;

import java.nio.file.Paths;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

        @Value("${upload.root}")
        private String localUploadDir;

        // /images/** 요청을 uploadPath 폴더의 실제 파일로 연결
        @Override
        public void addResourceHandlers(ResourceHandlerRegistry registry) {
                registry.addResourceHandler("/images/**")
                                .addResourceLocations("file:///" + localUploadDir + "/");

                registry.addResourceHandler("/uploads/**")
                                .addResourceLocations(
                                        Paths.get(localUploadDir, "images").toUri().toString(),
                                        Paths.get(localUploadDir, "files").toUri().toString(),
                                        Paths.get(localUploadDir).toUri().toString());
        }
}
