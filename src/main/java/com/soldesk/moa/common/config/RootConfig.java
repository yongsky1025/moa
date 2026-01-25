package com.soldesk.moa.common.config;

import org.modelmapper.ModelMapper;
import org.modelmapper.convention.MatchingStrategies;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration // 스프링 설정 파일
public class RootConfig {

    @Bean // 객체 생성해서 스프링 컨테이너가 관리
    ModelMapper getMapper() {
        ModelMapper modelMapper = new ModelMapper();
        modelMapper.getConfiguration()
                .setFieldMatchingEnabled(true) // 필드명 같은경우 매핑
                // getter, setter 없이도 private 필드 접근 허용
                .setFieldAccessLevel(org.modelmapper.config.Configuration.AccessLevel.PRIVATE)
                // userName, user_name : 비슷한 이름이면 알아서 매핑
                .setMatchingStrategy(MatchingStrategies.LOOSE);
        return modelMapper;
    }

}
