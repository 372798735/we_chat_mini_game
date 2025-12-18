package com.tomato.todo.backend.config;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.Arrays;
import java.util.List;

/**
 * Jackson配置 - 支持多种日期格式
 *
 * @author Tomato Todo Team
 * @version 1.0.0
 */
@Configuration
public class JacksonConfig {

    private static final List<DateTimeFormatter> DATE_FORMATTERS = Arrays.asList(
        DateTimeFormatter.ISO_DATE_TIME,           // ISO 8601 格式 (2025-12-20T04:30:00.000Z)
        DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"),  // 标准格式
        DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss"),   // ISO 8601 无毫秒
        DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSS"), // ISO 8601 带毫秒
        DateTimeFormatter.ofPattern("yyyy/MM/dd HH:mm:ss"),     // 斜杠格式
        DateTimeFormatter.ofPattern("MM/dd/yyyy HH:mm:ss")      // 美国格式
    );

    @Bean
    @Primary
    public ObjectMapper objectMapper() {
        ObjectMapper objectMapper = new ObjectMapper();

        // 注册Java 8时间模块
        JavaTimeModule javaTimeModule = new JavaTimeModule();

        // 注册自定义的LocalDateTime反序列化器
        javaTimeModule.addDeserializer(LocalDateTime.class, new FlexibleLocalDateTimeDeserializer());

        objectMapper.registerModule(javaTimeModule);

        // 配置序列化
        objectMapper.configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false);
        objectMapper.configure(SerializationFeature.WRITE_DATE_TIMESTAMPS_AS_NANOSECONDS, false);

        // 配置反序列化
        objectMapper.configure(com.fasterxml.jackson.databind.DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        objectMapper.configure(com.fasterxml.jackson.databind.DeserializationFeature.ACCEPT_EMPTY_STRING_AS_NULL_OBJECT, true);

        return objectMapper;
    }

    /**
     * 灵活的LocalDateTime反序列化器，支持多种日期格式
     */
    public static class FlexibleLocalDateTimeDeserializer extends JsonDeserializer<LocalDateTime> {

        @Override
        public LocalDateTime deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
            String dateStr = p.getValueAsString().trim();

            if (dateStr == null || dateStr.isEmpty()) {
                return null;
            }

            // 尝试使用各种格式解析日期
            for (DateTimeFormatter formatter : DATE_FORMATTERS) {
                try {
                    // 特殊处理ISO 8601格式，移除'Z'后缀
                    if (dateStr.endsWith("Z")) {
                        dateStr = dateStr.substring(0, dateStr.length() - 1);
                        return LocalDateTime.parse(dateStr, DateTimeFormatter.ISO_DATE_TIME);
                    }

                    return LocalDateTime.parse(dateStr, formatter);
                } catch (DateTimeParseException e) {
                    // 继续尝试下一个格式
                    continue;
                }
            }

            throw new IllegalArgumentException("无法解析日期字符串: " + dateStr + "，支持的格式: " + DATE_FORMATTERS);
        }
    }
}