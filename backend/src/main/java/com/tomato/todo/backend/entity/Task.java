package com.tomato.todo.backend.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonValue;
import com.fasterxml.jackson.annotation.JsonCreator;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 任务实体类
 *
 * @author Tomato Todo Team
 * @version 1.0.0
 */
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("t_task")
public class Task {

    @TableId(type = IdType.AUTO)
    private Long id;

    @TableField("user_id")
    private Long userId;

    @TableField("category_id")
    private Long categoryId;

    @TableField("title")
    private String title;

    @TableField("description")
    private String description;

    @TableField("summary")
    private String summary;

    @TableField("estimated_duration")
    private Integer estimatedDuration;

    @TableField("actual_duration")
    private Integer actualDuration;

    @TableField(value = "priority", typeHandler = com.tomato.todo.backend.handler.TaskPriorityTypeHandler.class)
    private Priority priority;

    @TableField(value = "status", typeHandler = com.tomato.todo.backend.handler.TaskStatusTypeHandler.class)
    private TaskStatus status;

    @TableField("due_date")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime dueDate;

    @TableField("reminder_time")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime reminderTime;

    @TableField("tags")
    private String tags;

    @TableField("sort_order")
    private Integer sortOrder;

    @TableField("parent_task_id")
    private Long parentTaskId;

    @TableField("is_recurring")
    private Boolean isRecurring;

    @TableField("recurrence_rule")
    private String recurrenceRule;

    @TableField("completion_rate")
    private Double completionRate;

    @TableField("created_at")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    @TableField("updated_at")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;

    @TableField("completed_at")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime completedAt;

    @TableField("deleted")
    @TableLogic
    private Boolean deleted;

    /**
     * 任务优先级枚举
     */
    public enum Priority {
        LOW("low", "低"),
        MEDIUM("medium", "中"),
        HIGH("high", "高");

        private final String value;
        private final String description;

        Priority(String value, String description) {
            this.value = value;
            this.description = description;
        }

        @JsonValue
        public String getValue() {
            return value;
        }

        @JsonCreator
        public static Priority fromValue(String value) {
            for (Priority priority : Priority.values()) {
                if (priority.value.equalsIgnoreCase(value)) {
                    return priority;
                }
            }
            throw new IllegalArgumentException("Unknown priority value: " + value);
        }
    }

    /**
     * 任务状态枚举
     */
    public enum TaskStatus {
        PENDING("pending", "待处理"),
        IN_PROGRESS("in_progress", "进行中"),
        COMPLETED("completed", "已完成"),
        PAUSED("paused", "已暂停"),
        CANCELLED("cancelled", "已取消");

        private final String value;
        private final String description;

        TaskStatus(String value, String description) {
            this.value = value;
            this.description = description;
        }

        @JsonValue
        public String getValue() {
            return value;
        }

        @JsonCreator
        public static TaskStatus fromValue(String value) {
            for (TaskStatus status : TaskStatus.values()) {
                if (status.value.equalsIgnoreCase(value)) {
                    return status;
                }
            }
            throw new IllegalArgumentException("Unknown task status value: " + value);
        }
    }
}