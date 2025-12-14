package com.tomato.todo.backend.dto.pomodoro;

import com.tomato.todo.backend.entity.Pomodoro;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 番茄钟响应DTO
 *
 * @author Tomato Todo Team
 * @version 1.0.0
 */
@Data
public class PomodoroResponse {

    private Long id;

    private Long taskId;

    private Long userId;

    private Pomodoro.PomodoroType type;

    private Integer plannedDuration;

    private Integer actualDuration;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime startedAt;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime endedAt;

    private Boolean isCompleted;

    private Integer interruptionCount;

    private String notes;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;
}