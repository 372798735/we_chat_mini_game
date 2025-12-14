package com.tomato.todo.backend.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 番茄钟记录实体类
 *
 * @author Tomato Todo Team
 * @version 1.0.0
 */
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("t_pomodoro")
public class Pomodoro {

    @TableId(type = IdType.AUTO)
    private Long id;

    @TableField("task_id")
    private Long taskId;

    @TableField("user_id")
    private Long userId;

    @TableField("type")
    private PomodoroType type;

    @TableField("planned_duration")
    private Integer plannedDuration;

    @TableField("actual_duration")
    private Integer actualDuration;

    @TableField("started_at")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime startedAt;

    @TableField("ended_at")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime endedAt;

    @TableField("is_completed")
    private Boolean isCompleted;

    @TableField("interruption_count")
    private Integer interruptionCount;

    @TableField("notes")
    private String notes;

    @TableField("created_at")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    @TableField("deleted")
    @TableLogic
    private Boolean deleted;

    /**
     * 番茄钟类型枚举
     */
    public enum PomodoroType {
        WORK("work", "工作时间"),
        SHORT_BREAK("short_break", "短休息"),
        LONG_BREAK("long_break", "长休息");

        private final String value;
        private final String description;

        PomodoroType(String value, String description) {
            this.value = value;
            this.description = description;
        }

        public String getValue() {
            return value;
        }

        public String getDescription() {
            return description;
        }
    }
}