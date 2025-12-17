package com.tomato.todo.backend.dto.task;

import com.tomato.todo.backend.entity.Task;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 任务响应DTO
 *
 * @author Tomato Todo Team
 * @version 1.0.0
 */
@Data
public class TaskResponse {

    private Long id;

    private Long userId;

    private Long categoryId;

    private String title;

    private String description;

    private String summary;

    private Integer estimatedDuration;

    private Integer actualDuration;

    private Task.Priority priority;

    private Task.TaskStatus status;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime dueDate;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime reminderTime;

    private String tags;

    private Integer sortOrder;

    private Long parentTaskId;

    private Boolean isRecurring;

    private String recurrenceRule;

    private Double completionRate;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime completedAt;
}