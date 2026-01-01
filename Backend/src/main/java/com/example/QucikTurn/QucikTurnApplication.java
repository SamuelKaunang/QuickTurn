package com.example.QucikTurn;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

// FIX: Explicit repository scanning untuk multi-module Spring Data
@SpringBootApplication
@EnableJpaRepositories(basePackages = "com.example.QucikTurn.Repository", excludeFilters = @org.springframework.context.annotation.ComponentScan.Filter(type = org.springframework.context.annotation.FilterType.ASSIGNABLE_TYPE, classes = com.example.QucikTurn.Repository.ChatMessageRepository.class))
@EnableMongoRepositories(basePackages = "com.example.QucikTurn.Repository", includeFilters = @org.springframework.context.annotation.ComponentScan.Filter(type = org.springframework.context.annotation.FilterType.ASSIGNABLE_TYPE, classes = com.example.QucikTurn.Repository.ChatMessageRepository.class))
public class QucikTurnApplication {

	public static void main(String[] args) {
		SpringApplication.run(QucikTurnApplication.class, args);
	}

}
