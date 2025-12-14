package com.tomato.todo.backend.dto.statistics;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 统计数据响应DTO
 *
 * @author Tomato Todo Team
 * @version 1.0.0
 */
@Data
public class StatisticsResponse {

    private Long id;

    private Long userId;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate statDate;

    private Integer totalTasks;

    private Integer completedTasks;

    private Integer totalPomodoros;

    private Integer totalFocusTime;

    private Double averageFocusTime;

    private List<Map<String, Object>> categoryDistribution;

    private List<Map<String, Object>> priorityDistribution;

    private Double completionRate;

    private Integer bestFocusHour;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;

    /**
     * 仪表板统计数据响应DTO
     */
    @Data
    public static class DashboardResponse {
        private StatisticsResponse today;
        private List<StatisticsResponse> weekly;
        private List<StatisticsResponse> monthly;
        private TotalStatistics total;
        private List<Map<String, Object>> categoryDistribution;
        private List<Map<String, Object>> priorityDistribution;
        private Integer bestFocusHour;
        private Double averageCompletionRate;
    }

    /**
     * 总统计数据响应DTO
     */
    @Data
    public static class TotalStatistics {
        private Long totalDays;
        private Integer totalTasks;
        private Integer completedTasks;
        private Integer totalPomodoros;
        private Integer totalFocusTime;
        private Double avgCompletionRate;
        private Double overallCompletionRate;

        // 计算总完成率
        public Double getOverallCompletionRate() {
            if (totalTasks != null && totalTasks > 0) {
                return completedTasks != null ?
                        Math.round((double) completedTasks / totalTasks * 10000.0) / 100.0 : 0.0;
            }
            return 0.0;
        }

        // 转换专注时长为小时
        public Double getTotalFocusHours() {
            return totalFocusTime != null ? Math.round(totalFocusTime / 60.0 * 100.0) / 100.0 : 0.0;
        }
    }

    /**
     * 时间段统计响应DTO
     */
    @Data
    public static class PeriodStatistics {
        private String period;
        private List<StatisticsResponse> data;
        private PeriodSummary summary;

        @Data
        public static class PeriodSummary {
            private Integer totalTasks;
            private Integer completedTasks;
            private Integer totalPomodoros;
            private Integer totalFocusTime;
            private Double avgCompletionRate;
            private Double avgDailyFocusTime;

            // 计算平均每日专注时长 - 需要传入数据列表来计算
            public Double getAvgDailyFocusTime(List<StatisticsResponse> dataList) {
                if (totalFocusTime != null && dataList != null && !dataList.isEmpty()) {
                    return Math.round((double) totalFocusTime / dataList.size() * 100.0) / 100.0;
                }
                return 0.0;
            }
        }
    }

    /**
     * 趋势统计响应DTO
     */
    @Data
    public static class TrendStatistics {
        private List<String> dates;
        private List<Integer> taskCounts;
        private List<Integer> completedCounts;
        private List<Integer> pomodoroCounts;
        private List<Integer> focusTimes;
        private List<Double> completionRates;
    }
}