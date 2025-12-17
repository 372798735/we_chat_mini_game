package com.tomato.todo.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.session.HttpSessionEventPublisher;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

/**
 * Spring Security配置 - 支持CORS和API访问控制
 *
 * @author Tomato Todo Team
 * @version 1.0.0
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // 启用CORS支持
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            // 禁用CSRF保护（API项目通常不需要）
            .csrf(csrf -> csrf.disable())
            // 配置授权规则
            .authorizeHttpRequests(authz -> authz
                // 允许所有OPTIONS请求（CORS预检）
                .requestMatchers("OPTIONS", "/**").permitAll()
                // 允许所有API请求访问（开发环境）
                .requestMatchers("/api/**").permitAll()
                // 允许健康检查端点
                .requestMatchers("/actuator/health").permitAll()
                // 允许API文档
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                // 其他所有请求需要认证
                .anyRequest().authenticated()
            )
            // 配置会话管理
            .sessionManagement(session -> session.maximumSessions(10));

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // 设置允许的源
        configuration.setAllowedOrigins(Arrays.asList(
                "http://localhost:3000",
                "http://127.0.0.1:3000",
                "http://localhost:3001",
                "http://127.0.0.1:3001",
                "http://localhost:3003",
                "http://127.0.0.1:3003",
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                "http://192.168.1.2:3000",
                "http://192.168.1.2:3001",
                "http://192.168.1.2:3003",
                "http://192.168.1.2:5173"
        ));

        // 设置允许的方法
        configuration.setAllowedMethods(Arrays.asList(
                "GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"
        ));

        // 设置允许的头部
        configuration.setAllowedHeaders(Arrays.asList("*"));

        // 设置暴露的头部
        configuration.setExposedHeaders(Arrays.asList(
                "Authorization", "Content-Type", "X-Total-Count", "X-Request-ID"
        ));

        // 允许凭证
        configuration.setAllowCredentials(true);

        // 设置预检请求有效期
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }

    @Bean
    public HttpSessionEventPublisher httpSessionEventPublisher() {
        return new HttpSessionEventPublisher();
    }
}