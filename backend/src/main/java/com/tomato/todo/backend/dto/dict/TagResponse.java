package com.tomato.todo.backend.dto.dict;

import lombok.Data;
import java.time.LocalDateTime;

/**
 * 标签响应DTO
 */
@Data
public class TagResponse {

    private Long id;

    private String name;

    private String color;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}