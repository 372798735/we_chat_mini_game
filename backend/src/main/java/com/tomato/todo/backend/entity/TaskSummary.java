package com.tomato.todo.backend.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 任务总结实体类
 *
 * @author Tomato Todo Team
 * @version 1.0.0
 */
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("t_task_summary")
public class TaskSummary {

    @TableId(type = IdType.AUTO)
    private Long id;

    @TableField("task_id")
    private Long taskId;

    @TableField("user_id")
    private Long userId;

    @TableField("rating")
    private Rating rating;

    @TableField("summary")
    private String summary;

    @TableField("tags")
    private String tags;

    @TableField("mood")
    private Mood mood;

    @TableField("difficulty")
    private Difficulty difficulty;

    @TableField("focus_level")
    private FocusLevel focusLevel;

    @TableField("created_at")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    @TableField("updated_at")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;

    @TableField("deleted")
    @TableLogic
    private Boolean deleted;

    /**
     * 完成度评价枚举
     */
    public enum Rating {
        EXCELLENT("excellent", "优秀"),
        GOOD("good", "良好"),
        AVERAGE("average", "一般"),
        POOR("poor", "较差");

        private final String value;
        private final String description;

        Rating(String value, String description) {
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

    /**
     * 心情枚举
     */
    public enum Mood {
        VERY_HAPPY("very_happy", "非常愉快"),
        HAPPY("happy", "愉快"),
        NEUTRAL("neutral", "一般"),
        UNHAPPY("unhappy", "不愉快"),
        VERY_UNHAPPY("very_unhappy", "很不愉快");

        private final String value;
        private final String description;

        Mood(String value, String description) {
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

    /**
     * 难度感受枚举
     */
    public enum Difficulty {
        VERY_EASY("very_easy", "很容易"),
        EASY("easy", "容易"),
        MEDIUM("medium", "适中"),
        HARD("hard", "困难"),
        VERY_HARD("very_hard", "很困难");

        private final String value;
        private final String description;

        Difficulty(String value, String description) {
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

    /**
     * 专注度枚举
     */
    public enum FocusLevel {
        VERY_FOCUSED("very_focused", "非常专注"),
        FOCUSED("focused", "专注"),
        NORMAL("normal", "一般"),
        DISTRACTED("distracted", "容易分心"),
        VERY_DISTRACTED("very_distracted", "很分心");

        private final String value;
        private final String description;

        FocusLevel(String value, String description) {
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