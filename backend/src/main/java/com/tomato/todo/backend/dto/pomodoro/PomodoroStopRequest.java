package com.tomato.todo.backend.dto.pomodoro;

import lombok.Data;

import jakarta.validation.constraints.Min;

/**
 * 番茄钟停止请求DTO
 *
 * @author Tomato Todo Team
 * @version 1.0.0
 */
@Data
public class PomodoroStopRequest {

    @Min(value = 0, message = "中断次数不能为负数")
    private Integer interruptionCount = 0;

    private Boolean isCompleted = false;

    private String notes;
}