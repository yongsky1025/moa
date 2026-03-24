package com.soldesk.moa.common.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

@Configuration
public class AsyncConfig {

    @Bean(name = "taskExecutor")
    public Executor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(4);      // 항상 대기 중인 쓰레드 수
        executor.setMaxPoolSize(8);       // 최대 쓰레드 수
        executor.setQueueCapacity(100);   // 대기 큐
        executor.setThreadNamePrefix("async-");
        executor.initialize();
        return executor;
    }
}
