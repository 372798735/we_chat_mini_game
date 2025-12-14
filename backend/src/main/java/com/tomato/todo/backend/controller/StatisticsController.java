package com.tomato.todo.backend.controller;

import com.tomato.todo.backend.common.ApiResponse;
import com.tomato.todo.backend.dto.statistics.StatisticsResponse;
import com.tomato.todo.backend.entity.Statistics;
import com.tomato.todo.backend.service.StatisticsService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * 统计数据控制器
 *
 * @author Tomato Todo Team
 * @version 1.0.0
 */
@Slf4j
@RestController
@RequestMapping("/api/statistics")
@RequiredArgsConstructor
@Tag(name = "统计数据管理", description = "数据统计和分析相关功能")
@CrossOrigin(origins = {
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000"
}, allowedHeaders = "*", methods = {
    RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT,
    RequestMethod.DELETE, RequestMethod.PATCH, RequestMethod.OPTIONS, RequestMethod.HEAD
}, allowCredentials = "true", maxAge = 3600)
public class StatisticsController {

    private final StatisticsService statisticsService;

    /**
     * 获取今日统计数据
     */
    @GetMapping("/today")
    @Operation(summary = "获取今日统计", description = "获取用户今日的统计数据")
    public ResponseEntity<ApiResponse<StatisticsResponse>> getTodayStatistics(
            @Parameter(hidden = true) @RequestHeader("X-User-Id") Long userId) {
        log.info("获取今日统计数据，用户ID: {}", userId);

        Statistics statistics = statisticsService.getTodayStatistics(userId);
        StatisticsResponse response = convertToResponse(statistics);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 获取最近7天统计数据
     */
    @GetMapping("/last-7-days")
    @Operation(summary = "获取最近7天统计", description = "获取用户最近7天的统计数据")
    public ResponseEntity<ApiResponse<List<StatisticsResponse>>> getLast7DaysStatistics(
            @Parameter(hidden = true) @RequestHeader("X-User-Id") Long userId) {
        log.info("获取最近7天统计数据，用户ID: {}", userId);

        List<Statistics> statistics = statisticsService.getLast7DaysStatistics(userId);
        List<StatisticsResponse> response = statistics.stream()
                .map(this::convertToResponse)
                .collect(java.util.stream.Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 获取最近30天统计数据
     */
    @GetMapping("/last-30-days")
    @Operation(summary = "获取最近30天统计", description = "获取用户最近30天的统计数据")
    public ResponseEntity<ApiResponse<List<StatisticsResponse>>> getLast30DaysStatistics(
            @Parameter(hidden = true) @RequestHeader("X-User-Id") Long userId) {
        log.info("获取最近30天统计数据，用户ID: {}", userId);

        List<Statistics> statistics = statisticsService.getLast30DaysStatistics(userId);
        List<StatisticsResponse> response = statistics.stream()
                .map(this::convertToResponse)
                .collect(java.util.stream.Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 获取本周统计数据
     */
    @GetMapping("/weekly")
    @Operation(summary = "获取本周统计", description = "获取用户本周的统计数据")
    public ResponseEntity<ApiResponse<List<StatisticsResponse>>> getWeeklyStatistics(
            @Parameter(hidden = true) @RequestHeader("X-User-Id") Long userId) {
        log.info("获取本周统计数据，用户ID: {}", userId);

        List<Statistics> statistics = statisticsService.getWeeklyStatistics(userId);
        List<StatisticsResponse> response = statistics.stream()
                .map(this::convertToResponse)
                .collect(java.util.stream.Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 获取本月统计数据
     */
    @GetMapping("/monthly")
    @Operation(summary = "获取本月统计", description = "获取用户本月的统计数据")
    public ResponseEntity<ApiResponse<List<StatisticsResponse>>> getMonthlyStatistics(
            @Parameter(hidden = true) @RequestHeader("X-User-Id") Long userId) {
        log.info("获取本月统计数据，用户ID: {}", userId);

        List<Statistics> statistics = statisticsService.getMonthlyStatistics(userId);
        List<StatisticsResponse> response = statistics.stream()
                .map(this::convertToResponse)
                .collect(java.util.stream.Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 获取年度统计数据
     */
    @GetMapping("/yearly")
    @Operation(summary = "获取年度统计", description = "获取用户本年度的统计数据")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getYearlyStatistics(
            @Parameter(hidden = true) @RequestHeader("X-User-Id") Long userId) {
        log.info("获取年度统计数据，用户ID: {}", userId);

        List<Map<String, Object>> response = statisticsService.getYearlyStatistics(userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 获取总统计数据概览
     */
    @GetMapping("/total")
    @Operation(summary = "获取总统计概览", description = "获取用户总的数据统计概览")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getTotalStatistics(
            @Parameter(hidden = true) @RequestHeader("X-User-Id") Long userId) {
        log.info("获取总统计数据概览，用户ID: {}", userId);

        Map<String, Object> response = statisticsService.getTotalStatistics(userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 获取分类分布统计
     */
    @GetMapping("/category-distribution")
    @Operation(summary = "获取分类分布统计", description = "获取用户任务的分类分布统计")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getCategoryDistribution(
            @Parameter(hidden = true) @RequestHeader("X-User-Id") Long userId) {
        log.info("获取分类分布统计，用户ID: {}", userId);

        List<Map<String, Object>> response = statisticsService.getCategoryDistribution(userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 获取优先级分布统计
     */
    @GetMapping("/priority-distribution")
    @Operation(summary = "获取优先级分布统计", description = "获取用户任务的优先级分布统计")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getPriorityDistribution(
            @Parameter(hidden = true) @RequestHeader("X-User-Id") Long userId) {
        log.info("获取优先级分布统计，用户ID: {}", userId);

        List<Map<String, Object>> response = statisticsService.getPriorityDistribution(userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 获取最佳专注时段
     */
    @GetMapping("/best-focus-hour")
    @Operation(summary = "获取最佳专注时段", description = "获取用户的最佳专注时段")
    public ResponseEntity<ApiResponse<Integer>> getBestFocusHour(
            @Parameter(hidden = true) @RequestHeader("X-User-Id") Long userId) {
        log.info("获取最佳专注时段，用户ID: {}", userId);

        Integer response = statisticsService.getBestFocusHour(userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 获取平均完成率
     */
    @GetMapping("/average-completion-rate")
    @Operation(summary = "获取平均完成率", description = "获取用户的平均任务完成率")
    public ResponseEntity<ApiResponse<Double>> getAverageCompletionRate(
            @Parameter(hidden = true) @RequestHeader("X-User-Id") Long userId) {
        log.info("获取平均完成率，用户ID: {}", userId);

        Double response = statisticsService.getAverageCompletionRate(userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 获取仪表板统计数据
     */
    @GetMapping("/dashboard")
    @Operation(summary = "获取仪表板统计", description = "获取仪表板展示的综合统计数据")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboardStatistics(
            @Parameter(hidden = true) @RequestHeader("X-User-Id") Long userId) {
        log.info("获取仪表板统计数据，用户ID: {}", userId);

        Map<String, Object> response = statisticsService.getDashboardStatistics(userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 手动计算指定日期的统计数据
     */
    @PostMapping("/calculate/{date}")
    @Operation(summary = "计算统计数据", description = "手动计算指定日期的统计数据")
    public ResponseEntity<ApiResponse<String>> calculateStatistics(
            @Parameter(hidden = true) @RequestHeader("X-User-Id") Long userId,
            @Parameter(description = "日期") @PathVariable @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate date) {
        log.info("手动计算统计数据，用户ID: {}, 日期: {}", userId, date);

        statisticsService.calculateDailyStatistics(userId, date);
        return ResponseEntity.ok(ApiResponse.success("统计数据计算完成"));
    }

    /**
     * 批量计算历史统计数据
     */
    @PostMapping("/calculate-history")
    @Operation(summary = "批量计算历史统计", description = "批量计算指定日期范围的统计数据")
    public ResponseEntity<ApiResponse<String>> calculateHistoryStatistics(
            @Parameter(hidden = true) @RequestHeader("X-User-Id") Long userId,
            @Parameter(description = "开始日期") @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @Parameter(description = "结束日期") @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate) {
        log.info("批量计算历史统计数据，用户ID: {}, 日期范围: {} 至 {}", userId, startDate, endDate);

        statisticsService.calculateHistoryStatistics(userId, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success("历史统计数据计算完成"));
    }

    /**
     * 获取指定日期范围的统计数据
     */
    @GetMapping("/range")
    @Operation(summary = "获取日期范围统计", description = "获取指定日期范围的统计数据")
    public ResponseEntity<ApiResponse<List<StatisticsResponse>>> getStatisticsByDateRange(
            @Parameter(hidden = true) @RequestHeader("X-User-Id") Long userId,
            @Parameter(description = "开始日期") @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @Parameter(description = "结束日期") @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate) {
        log.info("获取日期范围统计数据，用户ID: {}, 日期范围: {} 至 {}", userId, startDate, endDate);

        List<Statistics> statistics = statisticsService.getStatisticsByDateRange(userId, startDate, endDate);
        List<StatisticsResponse> response = statistics.stream()
                .map(this::convertToResponse)
                .collect(java.util.stream.Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 转换为响应DTO
     */
    private StatisticsResponse convertToResponse(Statistics statistics) {
        if (statistics == null) return null;

        StatisticsResponse response = new StatisticsResponse();
        response.setId(statistics.getId());
        response.setUserId(statistics.getUserId());
        response.setStatDate(statistics.getStatDate());
        response.setTotalTasks(statistics.getTotalTasks());
        response.setCompletedTasks(statistics.getCompletedTasks());
        response.setTotalPomodoros(statistics.getTotalPomodoros());
        response.setTotalFocusTime(statistics.getTotalFocusTime());
        response.setAverageFocusTime(statistics.getAverageFocusTime());
        response.setCompletionRate(statistics.getCompletionRate());
        response.setBestFocusHour(statistics.getBestFocusHour());
        response.setCreatedAt(statistics.getCreatedAt());
        response.setUpdatedAt(statistics.getUpdatedAt());

        // 解析JSON字符串为对象列表
        try {
            if (statistics.getCategoryDistribution() != null) {
                response.setCategoryDistribution(
                    new com.fasterxml.jackson.databind.ObjectMapper().readValue(
                        statistics.getCategoryDistribution(),
                        new com.fasterxml.jackson.core.type.TypeReference<List<Map<String, Object>>>() {}
                    )
                );
            }
            if (statistics.getPriorityDistribution() != null) {
                response.setPriorityDistribution(
                    new com.fasterxml.jackson.databind.ObjectMapper().readValue(
                        statistics.getPriorityDistribution(),
                        new com.fasterxml.jackson.core.type.TypeReference<List<Map<String, Object>>>() {}
                    )
                );
            }
        } catch (Exception e) {
            log.error("解析分布统计数据失败", e);
        }

        return response;
    }

    /**
     * API响应包装类
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