package com.tomato.todo.backend.dto.task;

import com.tomato.todo.backend.entity.Task;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonFormat;

import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

/**
 * 任务创建请求DTO
 *
 * @author Tomato Todo Team
 * @version 1.0.0
 */
@Data
public class TaskCreateRequest {

    @NotBlank(message = "任务标题不能为空")
    @Size(max = 100, message = "任务标题长度不能超过100个字符")
    private String title;

    @Size(max = 500, message = "任务描述长度不能超过500个字符")
    private String description;

    @Size(max = 1000, message = "任务总结长度不能超过1000个字符")
    private String summary;

    @NotNull(message = "预计时长不能为空")
    @Min(value = 1, message = "预计时长至少1分钟")
    @Max(value = 480, message = "预计时长不能超过480分钟")
    private Integer estimatedDuration;

    private Long categoryId;

    private Task.Priority priority = Task.Priority.MEDIUM;

    private Task.TaskStatus status = Task.TaskStatus.PENDING;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "Asia/Shanghai")
    private LocalDateTime dueDate;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "Asia/Shanghai")
    private LocalDateTime reminderTime;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    @Size(max = 255, message = "标签长度不能超过255个字符")
    private String tags;

    private Integer sortOrder = 0;

    private Long parentTaskId;

    private Boolean isRecurring = false;

    @Size(max = 100, message = "循环规则长度不能超过100个字符")
    private String recurrenceRule;
}