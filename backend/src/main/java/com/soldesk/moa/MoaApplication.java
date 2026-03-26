package com.soldesk.moa;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableJpaAuditing // BaseEntity @EntityListeners 동작
@EnableScheduling
@EnableAsync // 사용자 활동 로그 기록(비동기처리) 어노테이션, 지우지마세요
@SpringBootApplication
public class MoaApplication {

	public static void main(String[] args) {
		SpringApplication.run(MoaApplication.class, args);
	}

}
