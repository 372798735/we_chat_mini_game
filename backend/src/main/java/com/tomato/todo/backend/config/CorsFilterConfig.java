package com.tomato.todo.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

/**
 * 强制CORS过滤器配置 - 暂时禁用，使用SimpleCorsConfig
 *
 * @author Tomato Todo Team
 * @version 1.0.0
 */
// @Configuration  // 暂时禁用此配置，避免冲突
public class CorsFilterConfig {

    @Bean
    public org.springframework.web.filter.CorsFilter corsFilter() {
        CorsConfiguration configuration = new CorsConfiguration();

        // 设置允许的源（不使用通配符，因为allowCredentials=true）
        configuration.setAllowedOrigins(Arrays.asList(
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                "http://localhost:3000",
                "http://127.0.0.1:3000"
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

        return new org.springframework.web.filter.CorsFilter(source);
    }
}