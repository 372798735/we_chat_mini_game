package com.tomato.todo.backend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tomato.todo.backend.entity.Statistics;
import com.tomato.todo.backend.repository.StatisticsRepository;
import com.tomato.todo.backend.repository.TaskRepository;
import com.tomato.todo.backend.repository.PomodoroRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 统计服务类
 *
 * @author Tomato Todo Team
 * @version 1.0.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class StatisticsService {

    private final StatisticsRepository statisticsRepository;
    private final TaskRepository taskRepository;
    private final PomodoroRepository pomodoroRepository;
    private final ObjectMapper objectMapper;

    /**
     * 计算并保存用户当日统计数据
     */
    @Transactional
    public void calculateDailyStatistics(Long userId, LocalDate date) {
        log.info("计算用户 {} 的 {} 统计数据", userId, date);

        // 检查是否已存在当日统计数据
        Statistics existingStats = statisticsRepository.findByUserIdAndDate(userId, date);

        Statistics stats = existingStats != null ? existingStats : new Statistics();
        stats.setUserId(userId);
        stats.setStatDate(date);
        stats.setUpdatedAt(LocalDateTime.now());

        // 计算任务统计
        calculateTaskStatistics(userId, date, stats);

        // 计算番茄钟统计
        calculatePomodoroStatistics(userId, date, stats);

        // 计算分布统计
        calculateDistributionStatistics(userId, date, stats);

        if (existingStats == null) {
            stats.setCreatedAt(LocalDateTime.now());
            statisticsRepository.insert(stats);
        } else {
            statisticsRepository.updateById(stats);
        }

        log.info("统计数据计算完成，用户: {}, 日期: {}", userId, date);
    }

    /**
     * 获取今日统计
     */
    public Statistics getTodayStatistics(Long userId) {
        LocalDate today = LocalDate.now();
        Statistics stats = statisticsRepository.findByUserIdAndDate(userId, today);

        if (stats == null) {
            calculateDailyStatistics(userId, today);
            stats = statisticsRepository.findByUserIdAndDate(userId, today);
        }

        return stats;
    }

    /**
     * 获取最近7天统计
     */
    public List<Statistics> getLast7DaysStatistics(Long userId) {
        return statisticsRepository.findLast7DaysStatistics(userId);
    }

    /**
     * 获取最近30天统计
     */
    public List<Statistics> getLast30DaysStatistics(Long userId) {
        return statisticsRepository.findLast30DaysStatistics(userId);
    }

    /**
     * 获取本周统计
     */
    public List<Statistics> getWeeklyStatistics(Long userId) {
        LocalDate now = LocalDate.now();
        LocalDate weekStart = now.minusDays(now.getDayOfWeek().getValue() - 1); // 周一
        LocalDate weekEnd = weekStart.plusDays(6); // 周日

        return statisticsRepository.findWeeklyStatistics(userId, weekStart, weekEnd);
    }

    /**
     * 获取本月统计
     */
    public List<Statistics> getMonthlyStatistics(Long userId) {
        LocalDate now = LocalDate.now();
        return statisticsRepository.findMonthlyStatistics(userId, now.getYear(), now.getMonthValue());
    }

    /**
     * 获取年度统计
     */
    public List<Map<String, Object>> getYearlyStatistics(Long userId) {
        LocalDate now = LocalDate.now();
        return statisticsRepository.findYearlyStatistics(userId, now.getYear());
    }

    /**
     * 获取总统计概览
     */
    public Map<String, Object> getTotalStatistics(Long userId) {
        return statisticsRepository.getTotalStatisticsByUserId(userId);
    }

    /**
     * 获取分类分布统计
     */
    public List<Map<String, Object>> getCategoryDistribution(Long userId) {
        return statisticsRepository.getCategoryDistribution(userId);
    }

    /**
     * 获取优先级分布统计
     */
    public List<Map<String, Object>> getPriorityDistribution(Long userId) {
        return statisticsRepository.getPriorityDistribution(userId);
    }

    /**
     * 获取最佳专注时段
     */
    public Integer getBestFocusHour(Long userId) {
        Map<String, Object> result = statisticsRepository.getBestFocusHour(userId);
        if (result != null && result.containsKey("best_focus_hour")) {
            return (Integer) result.get("best_focus_hour");
        }
        return null;
    }

    /**
     * 获取平均完成率
     */
    public Double getAverageCompletionRate(Long userId) {
        return statisticsRepository.getAverageCompletionRate(userId);
    }

    /**
     * 计算任务统计数据
     */
    private void calculateTaskStatistics(Long userId, LocalDate date, Statistics stats) {
        // 使用现有Repository方法计算统计数据
        // 这里简化处理，实际应用中可能需要更精确的日期范围查询
        long pendingTasks = taskRepository.countByUserIdAndStatus(userId, com.tomato.todo.backend.entity.Task.TaskStatus.PENDING);
        long inProgressTasks = taskRepository.countByUserIdAndStatus(userId, com.tomato.todo.backend.entity.Task.TaskStatus.IN_PROGRESS);
        long completedTasks = taskRepository.countByUserIdAndStatus(userId, com.tomato.todo.backend.entity.Task.TaskStatus.COMPLETED);
        long pausedTasks = taskRepository.countByUserIdAndStatus(userId, com.tomato.todo.backend.entity.Task.TaskStatus.PAUSED);
        long cancelledTasks = taskRepository.countByUserIdAndStatus(userId, com.tomato.todo.backend.entity.Task.TaskStatus.CANCELLED);

        long totalTasks = pendingTasks + inProgressTasks + completedTasks + pausedTasks + cancelledTasks;

        stats.setTotalTasks((int) totalTasks);
        stats.setCompletedTasks((int) completedTasks);

        // 完成率
        double completionRate = totalTasks > 0 ? (double) completedTasks / totalTasks * 100 : 0.0;
        stats.setCompletionRate(Math.round(completionRate * 100.0) / 100.0);
    }

    /**
     * 计算番茄钟统计数据
     */
    private void calculatePomodoroStatistics(Long userId, LocalDate date, Statistics stats) {
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(23, 59, 59);

        // 今日番茄钟记录
        List<com.tomato.todo.backend.entity.Pomodoro> pomodoros =
                pomodoroRepository.findByUserIdAndDateRange(userId, startOfDay, endOfDay);

        // 工作番茄钟统计
        List<com.tomato.todo.backend.entity.Pomodoro> workPomodoros = pomodoros.stream()
                .filter(p -> p.getType() == com.tomato.todo.backend.entity.Pomodoro.PomodoroType.WORK)
                .collect(Collectors.toList());

        int totalPomodoros = workPomodoros.size();
        int totalFocusTime = workPomodoros.stream()
                .filter(p -> p.getIsCompleted())
                .mapToInt(com.tomato.todo.backend.entity.Pomodoro::getActualDuration)
                .sum();

        double averageFocusTime = totalPomodoros > 0 ?
                (double) totalFocusTime / totalPomodoros : 0.0;

        stats.setTotalPomodoros(totalPomodoros);
        stats.setTotalFocusTime(totalFocusTime);
        stats.setAverageFocusTime(Math.round(averageFocusTime * 100.0) / 100.0);

        // 计算最佳专注时段
        Map<Integer, Long> hourFocusTime = workPomodoros.stream()
                .filter(p -> p.getIsCompleted() && p.getStartedAt() != null)
                .collect(Collectors.groupingBy(
                        p -> p.getStartedAt().getHour(),
                        Collectors.summingLong(com.tomato.todo.backend.entity.Pomodoro::getActualDuration)
                ));

        stats.setBestFocusHour(hourFocusTime.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse(null));
    }

    /**
     * 计算分布统计数据
     */
    private void calculateDistributionStatistics(Long userId, LocalDate date, Statistics stats) {
        try {
            // 分类分布
            List<Map<String, Object>> categoryDist = statisticsRepository.getCategoryDistribution(userId);
            stats.setCategoryDistribution(objectMapper.writeValueAsString(categoryDist));

            // 优先级分布
            List<Map<String, Object>> priorityDist = statisticsRepository.getPriorityDistribution(userId);
            stats.setPriorityDistribution(objectMapper.writeValueAsString(priorityDist));

        } catch (JsonProcessingException e) {
            log.error("序列化分布统计数据失败", e);
            stats.setCategoryDistribution("{}");
            stats.setPriorityDistribution("{}");
        }
    }

    /**
     * 批量计算历史统计数据
     */
    @Transactional
    public void calculateHistoryStatistics(Long userId, LocalDate startDate, LocalDate endDate) {
        log.info("批量计算用户 {} 的历史统计数据，日期范围: {} 至 {}", userId, startDate, endDate);

        LocalDate currentDate = startDate;
        while (!currentDate.isAfter(endDate)) {
            calculateDailyStatistics(userId, currentDate);
            currentDate = currentDate.plusDays(1);
        }

        log.info("历史统计数据批量计算完成");
    }

    /**
     * 获取统计数据仪表板
     */
    public Map<String, Object> getDashboardStatistics(Long userId) {
        Map<String, Object> dashboard = new HashMap<>();

        // 今日统计
        Statistics todayStats = getTodayStatistics(userId);
        dashboard.put("today", todayStats);

        // 本周统计
        List<Statistics> weeklyStats = getWeeklyStatistics(userId);
        dashboard.put("weekly", weeklyStats);

        // 本月统计
        List<Statistics> monthlyStats = getMonthlyStatistics(userId);
        dashboard.put("monthly", monthlyStats);

        // 总统计
        Map<String, Object> totalStats = getTotalStatistics(userId);
        dashboard.put("total", totalStats);

        // 分布统计
        dashboard.put("categoryDistribution", getCategoryDistribution(userId));
        dashboard.put("priorityDistribution", getPriorityDistribution(userId));

        // 最佳专注时段
        dashboard.put("bestFocusHour", getBestFocusHour(userId));

        // 平均完成率
        dashboard.put("averageCompletionRate", getAverageCompletionRate(userId));

        return dashboard;
    }

    /**
     * 获取指定日期范围的统计数据
     */
    public List<Statistics> getStatisticsByDateRange(Long userId, LocalDate startDate, LocalDate endDate) {
        return statisticsRepository.findByUserIdAndDateRange(userId, startDate, endDate);
    }
}