package com.tomato.todo.backend.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 数据统计实体类
 *
 * @author Tomato Todo Team
 * @version 1.0.0
 */
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("t_statistics")
public class Statistics {

    @TableId(type = IdType.AUTO)
    private Long id;

    @TableField("user_id")
    private Long userId;

    @TableField("stat_date")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate statDate;

    @TableField("total_tasks")
    private Integer totalTasks;

    @TableField("completed_tasks")
    private Integer completedTasks;

    @TableField("total_pomodoros")
    private Integer totalPomodoros;

    @TableField("total_focus_time")
    private Integer totalFocusTime;

    @TableField("average_focus_time")
    private Double averageFocusTime;

    @TableField("category_distribution")
    private String categoryDistribution; // JSON格式存储

    @TableField("priority_distribution")
    private String priorityDistribution; // JSON格式存储

    @TableField("completion_rate")
    private Double completionRate;

    @TableField("best_focus_hour")
    private Integer bestFocusHour;

    @TableField("created_at")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    @TableField("updated_at")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;

    @TableField("deleted")
    @TableLogic
    private Boolean deleted;
}