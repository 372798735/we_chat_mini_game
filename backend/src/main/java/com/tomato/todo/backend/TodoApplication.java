package com.tomato.todo.backend;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * 番茄闹钟待办清单后端应用启动类
 *
 * @author Tomato Todo Team
 * @version 1.0.0
 */
@SpringBootApplication
@ComponentScan(basePackages = "com.tomato.todo.backend")
@MapperScan("com.tomato.todo.backend.repository")
@EnableAsync
@EnableScheduling
public class TodoApplication {

    public static void main(String[] args) {
        SpringApplication.run(TodoApplication.class, args);
    }
}