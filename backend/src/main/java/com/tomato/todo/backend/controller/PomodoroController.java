package com.tomato.todo.backend.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.tomato.todo.backend.common.ApiResponse;
import com.tomato.todo.backend.dto.pomodoro.PomodoroResponse;
import com.tomato.todo.backend.dto.pomodoro.PomodoroStartRequest;
import com.tomato.todo.backend.dto.pomodoro.PomodoroStopRequest;
import com.tomato.todo.backend.service.PomodoroService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 番茄钟控制器
 *
 * @author Tomato Todo Team
 * @version 1.0.0
 */
@Slf4j
@RestController
@RequestMapping("/api/pomodoro")
@RequiredArgsConstructor
@Tag(name = "番茄钟管理", description = "番茄钟计时器相关功能")
@CrossOrigin(origins = {
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000"
}, allowedHeaders = "*", methods = {
    RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT,
    RequestMethod.DELETE, RequestMethod.PATCH, RequestMethod.OPTIONS, RequestMethod.HEAD
}, allowCredentials = "true", maxAge = 3600)
public class PomodoroController {

    private final PomodoroService pomodoroService;

    /**
     * 开始番茄钟
     */
    @PostMapping("/start")
    @Operation(summary = "开始番茄钟", description = "开始一个新的番茄钟计时")
    public ResponseEntity<ApiResponse<PomodoroResponse>> startPomodoro(
            @Parameter(hidden = true) @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody PomodoroStartRequest request) {
        log.info("开始番茄钟请求，用户ID: {}, 任务ID: {}", userId, request.getTaskId());

        PomodoroResponse response = pomodoroService.startPomodoro(userId, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 停止番茄钟
     */
    @PostMapping("/{pomodoroId}/stop")
    @Operation(summary = "停止番茄钟", description = "停止指定的番茄钟计时")
    public ResponseEntity<ApiResponse<PomodoroResponse>> stopPomodoro(
            @Parameter(hidden = true) @RequestHeader("X-User-Id") Long userId,
            @Parameter(description = "番茄钟ID") @PathVariable Long pomodoroId,
            @Valid @RequestBody PomodoroStopRequest request) {
        log.info("停止番茄钟请求，用户ID: {}, 番茄钟ID: {}", userId, pomodoroId);

        PomodoroResponse response = pomodoroService.stopPomodoro(userId, pomodoroId, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 获取当前活跃的番茄钟
     */
    @GetMapping("/active")
    @Operation(summary = "获取活跃番茄钟", description = "获取当前正在进行的番茄钟")
    public ResponseEntity<ApiResponse<PomodoroResponse>> getActivePomodoro(
            @Parameter(hidden = true) @RequestHeader("X-User-Id") Long userId) {
        log.info("获取活跃番茄钟，用户ID: {}", userId);

        PomodoroResponse response = pomodoroService.getActivePomodoro(userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 强制停止当前活跃的番茄钟（调试用）
     */
    @PostMapping("/force-stop")
    @Operation(summary = "强制停止活跃番茄钟", description = "强制停止当前正在进行的番茄钟")
    public ResponseEntity<ApiResponse<String>> forceStopActivePomodoro(
            @Parameter(hidden = true) @RequestHeader("X-User-Id") Long userId) {
        log.info("强制停止活跃番茄钟，用户ID: {}", userId);

        try {
            pomodoroService.forceStopActivePomodoroSql(userId);
            return ResponseEntity.ok(ApiResponse.success("成功停止活跃番茄钟"));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.success("没有活跃的番茄钟需要停止"));
        }
    }

    /**
     * 获取番茄钟记录列表
     */
    @GetMapping
    @Operation(summary = "获取番茄钟列表", description = "分页查询番茄钟记录")
    public ResponseEntity<ApiResponse<IPage<PomodoroResponse>>> getPomodoros(
            @Parameter(hidden = true) @RequestHeader("X-User-Id") Long userId,
            @Parameter(description = "页码") @RequestParam(defaultValue = "1") Integer pageNum,
            @Parameter(description = "每页大小") @RequestParam(defaultValue = "20") Integer pageSize) {
        log.info("获取番茄钟列表，用户ID: {}, 页码: {}", userId, pageNum);

        IPage<PomodoroResponse> response = pomodoroService.getPomodoros(userId, pageNum, pageSize);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 根据任务ID获取番茄钟记录
     */
    @GetMapping("/task/{taskId}")
    @Operation(summary = "按任务查询番茄钟", description = "查询指定任务的所有番茄钟记录")
    public ResponseEntity<ApiResponse<List<PomodoroResponse>>> getPomodorosByTaskId(
            @Parameter(hidden = true) @RequestHeader("X-User-Id") Long userId,
            @Parameter(description = "任务ID") @PathVariable Long taskId) {
        log.info("按任务查询番茄钟，用户ID: {}, 任务ID: {}", userId, taskId);

        List<PomodoroResponse> response = pomodoroService.getPomodorosByTaskId(userId, taskId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 获取今日番茄钟记录
     */
    @GetMapping("/today")
    @Operation(summary = "获取今日番茄钟", description = "查询今天的所有番茄钟记录")
    public ResponseEntity<ApiResponse<List<PomodoroResponse>>> getTodayPomodoros(
            @Parameter(hidden = true) @RequestHeader("X-User-Id") Long userId) {
        log.info("获取今日番茄钟，用户ID: {}", userId);

        List<PomodoroResponse> response = pomodoroService.getTodayPomodoros(userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 获取最近番茄钟记录
     */
    @GetMapping("/recent")
    @Operation(summary = "获取最近番茄钟", description = "查询最近的番茄钟记录")
    public ResponseEntity<ApiResponse<List<PomodoroResponse>>> getRecentPomodoros(
            @Parameter(hidden = true) @RequestHeader("X-User-Id") Long userId,
            @Parameter(description = "记录数量") @RequestParam(defaultValue = "10") Integer limit) {
        log.info("获取最近番茄钟，用户ID: {}, 限制: {}", userId, limit);

        List<PomodoroResponse> response = pomodoroService.getRecentPomodoros(userId, limit);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 获取指定日期范围的番茄钟记录
     */
    @GetMapping("/range")
    @Operation(summary = "按日期范围查询番茄钟", description = "查询指定日期范围内的番茄钟记录")
    public ResponseEntity<ApiResponse<List<PomodoroResponse>>> getPomodorosByDateRange(
            @Parameter(hidden = true) @RequestHeader("X-User-Id") Long userId,
            @Parameter(description = "开始日期") @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime startDate,
            @Parameter(description = "结束日期") @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime endDate) {
        log.info("按日期范围查询番茄钟，用户ID: {}, 开始: {}, 结束: {}", userId, startDate, endDate);

        List<PomodoroResponse> response = pomodoroService.getPomodorosByDateRange(userId, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 获取今日番茄钟统计
     */
    @GetMapping("/statistics/today")
    @Operation(summary = "获取今日统计", description = "获取今日番茄钟的统计数据")
    public ResponseEntity<ApiResponse<PomodoroService.PomodoroStatistics>> getTodayStatistics(
            @Parameter(hidden = true) @RequestHeader("X-User-Id") Long userId) {
        log.info("获取今日番茄钟统计，用户ID: {}", userId);

        PomodoroService.PomodoroStatistics response = pomodoroService.getTodayStatistics(userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * API响应包装类（临时引用，应该移到common包中）
     */
    public static class ApiResponse<T> {
        private int code;
        private String message;
        private T data;

        public ApiResponse() {}

        public ApiResponse(int code, String message, T data) {
            this.code = code;
            this.message = message;
            this.data = data;
        }

        public static <T> ApiResponse<T> success(T data) {
            return new ApiResponse<>(200, "success", data);
        }

        public static <T> ApiResponse<T> success() {
            return new ApiResponse<>(200, "success", null);
        }

        public static <T> ApiResponse<T> success(String message, T data) {
            return new ApiResponse<>(200, message, data);
        }

        public static <T> ApiResponse<T> error(int code, String message) {
            return new ApiResponse<>(code, message, null);
        }

        public static <T> ApiResponse<T> error(String message) {
            return new ApiResponse<>(500, message, null);
        }

        // Getters and Setters
        public int getCode() { return code; }
        public void setCode(int code) { this.code = code; }

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }

        public T getData() { return data; }
        public void setData(T data) { this.data = data; }
    }
}