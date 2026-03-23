package com.soldesk.moa;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableAsync;

@EnableAsync
@EnableJpaAuditing // BaseEntity @EntityListeners 동작
@SpringBootApplication
public class MoaApplication {

	public static void main(String[] args) {
		SpringApplication.run(MoaApplication.class, args);
	}

}
