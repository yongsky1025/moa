package com.soldesk.moa;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableJpaAuditing // BaseEntity @EntityListeners 동작
@SpringBootApplication
@EnableAsync // 비동기 메소드 실행 활성화
@EnableScheduling // 스케줄링 기능 활성화
public class MoaApplication {

	public static void main(String[] args) {
		SpringApplication.run(MoaApplication.class, args);
	}

}
