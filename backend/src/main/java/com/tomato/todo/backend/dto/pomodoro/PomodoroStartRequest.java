package com.tomato.todo.backend.dto.pomodoro;

import com.tomato.todo.backend.entity.Pomodoro;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

/**
 * 番茄钟开始请求DTO
 *
 * @author Tomato Todo Team
 * @version 1.0.0
 */
@Data
public class PomodoroStartRequest {

    @NotNull(message = "任务ID不能为空")
    private Long taskId;

    @NotNull(message = "番茄钟类型不能为空")
    private Pomodoro.PomodoroType type;

    @NotNull(message = "计划时长不能为空")
    @Min(value = 1, message = "计划时长至少1分钟")
    @Max(value = 60, message = "计划时长不能超过60分钟")
    private Integer plannedDuration;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime startedAt;

    private String notes;
}