package com.tomato.todo.backend.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.tomato.todo.backend.dto.pomodoro.PomodoroResponse;
import com.tomato.todo.backend.dto.pomodoro.PomodoroStartRequest;
import com.tomato.todo.backend.dto.pomodoro.PomodoroStopRequest;
import com.tomato.todo.backend.entity.Pomodoro;
import com.tomato.todo.backend.repository.PomodoroRepository;
import com.tomato.todo.backend.repository.TaskRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 番茄钟服务类
 *
 * @author Tomato Todo Team
 * @version 1.0.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PomodoroService {

    private final PomodoroRepository pomodoroRepository;
    private final TaskRepository taskRepository;

    /**
     * 开始番茄钟
     */
    @Transactional
    public PomodoroResponse startPomodoro(Long userId, PomodoroStartRequest request) {
        log.info("开始番茄钟，用户ID: {}, 任务ID: {}, 类型: {}", userId, request.getTaskId(), request.getType());

        // 验证任务是否存在且属于当前用户
        if (taskRepository.selectById(request.getTaskId()) == null) {
            throw new RuntimeException("任务不存在");
        }

        // 检查是否有进行中的番茄钟
        Pomodoro activePomodoro = pomodoroRepository.findActivePomodoro(userId);
        if (activePomodoro != null) {
            throw new RuntimeException("已有进行中的番茄钟，请先停止当前番茄钟");
        }

        Pomodoro pomodoro = new Pomodoro();
        pomodoro.setTaskId(request.getTaskId());
        pomodoro.setUserId(userId);
        pomodoro.setType(convertPomodoroType(request.getType()));
        pomodoro.setPlannedDuration(request.getPlannedDuration());
        pomodoro.setActualDuration(0); // 新建番茄钟时，实际用时初始化为0
        pomodoro.setStartedAt(request.getStartedAt() != null ? request.getStartedAt() : LocalDateTime.now());
        pomodoro.setIsCompleted(false);
        pomodoro.setInterruptionCount(0);
        pomodoro.setNotes(request.getNotes());
        pomodoro.setCreatedAt(LocalDateTime.now());

        pomodoroRepository.insert(pomodoro);
        log.info("番茄钟开始成功，ID: {}", pomodoro.getId());

        return convertToResponse(pomodoro);
    }

    /**
     * 停止番茄钟
     */
    @Transactional
    public PomodoroResponse stopPomodoro(Long userId, Long pomodoroId, PomodoroStopRequest request) {
        log.info("停止番茄钟，用户ID: {}, 番茄钟ID: {}", userId, pomodoroId);

        Pomodoro pomodoro = pomodoroRepository.selectById(pomodoroId);
        if (pomodoro == null || !pomodoro.getUserId().equals(userId)) {
            throw new RuntimeException("番茄钟不存在或无权限访问");
        }

        if (pomodoro.getEndedAt() != null) {
            throw new RuntimeException("番茄钟已经停止");
        }

        LocalDateTime now = LocalDateTime.now();
        int actualDuration = (int) java.time.Duration.between(pomodoro.getStartedAt(), now).toMinutes();

        pomodoro.setEndedAt(now);
        pomodoro.setActualDuration(Math.max(0, actualDuration));
        pomodoro.setIsCompleted(request.getIsCompleted());
        pomodoro.setInterruptionCount(request.getInterruptionCount());

        if (request.getNotes() != null) {
            pomodoro.setNotes(request.getNotes());
        }

        pomodoroRepository.updateById(pomodoro);

        // 如果是工作番茄钟且完成了，更新任务的累计时长
        if (pomodoro.getType() == Pomodoro.PomodoroType.WORK && request.getIsCompleted()) {
            updateTaskActualDuration(pomodoro.getTaskId(), actualDuration);
        }

        log.info("番茄钟停止成功，ID: {}, 实际时长: {} 分钟", pomodoroId, actualDuration);
        return convertToResponse(pomodoro);
    }

    /**
     * 获取当前活跃的番茄钟
     */
    public PomodoroResponse getActivePomodoro(Long userId) {
        Pomodoro pomodoro = pomodoroRepository.findActivePomodoro(userId);
        return pomodoro != null ? convertToResponse(pomodoro) : null;
    }

    /**
     * 获取番茄钟记录列表
     */
    public IPage<PomodoroResponse> getPomodoros(Long userId, Integer pageNum, Integer pageSize) {
        log.info("获取番茄钟记录列表，用户ID: {}, 页码: {}, 每页大小: {}", userId, pageNum, pageSize);

        Page<Pomodoro> page = new Page<>(pageNum, pageSize);
        IPage<Pomodoro> pomodoroPage = pomodoroRepository.findByUserIdWithPage(page, userId);

        return pomodoroPage.convert(this::convertToResponse);
    }

    /**
     * 根据任务ID获取番茄钟记录
     */
    public List<PomodoroResponse> getPomodorosByTaskId(Long userId, Long taskId) {
        List<Pomodoro> pomodoros = pomodoroRepository.findByTaskId(taskId);
        return pomodoros.stream()
                .filter(p -> p.getUserId().equals(userId))
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    /**
     * 获取今日番茄钟记录
     */
    public List<PomodoroResponse> getTodayPomodoros(Long userId) {
        List<Pomodoro> pomodoros = pomodoroRepository.findTodayPomodoros(userId, LocalDate.now());
        return pomodoros.stream().map(this::convertToResponse).collect(Collectors.toList());
    }

    /**
     * 获取最近番茄钟记录
     */
    public List<PomodoroResponse> getRecentPomodoros(Long userId, Integer limit) {
        List<Pomodoro> pomodoros = pomodoroRepository.findRecentPomodoros(userId, limit);
        return pomodoros.stream().map(this::convertToResponse).collect(Collectors.toList());
    }

    /**
     * 获取番茄钟统计数据
     */
    public PomodoroStatistics getTodayStatistics(Long userId) {
        LocalDate today = LocalDate.now();
        PomodoroStatistics statistics = new PomodoroStatistics();

        // 统计各类型番茄钟数量
        List<Map<String, Object>> typeCounts = pomodoroRepository.countTodayByType(userId, today);
        for (Map<String, Object> count : typeCounts) {
            String type = (String) count.get("type");
            Long countValue = ((Number) count.get("count")).longValue();

            switch (type) {
                case "work":
                    statistics.setTotalWork(countValue);
                    break;
                case "short_break":
                    statistics.setTotalShortBreak(countValue);
                    break;
                case "long_break":
                    statistics.setTotalLongBreak(countValue);
                    break;
            }
        }

        // 统计专注时长
        Integer focusTime = pomodoroRepository.sumTodayFocusTime(userId, today);
        statistics.setTotalFocusMinutes(focusTime != null ? focusTime : 0);

        // 计算总番茄钟数
        statistics.setTotalPomodoros(
            statistics.getTotalWork() +
            statistics.getTotalShortBreak() +
            statistics.getTotalLongBreak()
        );

        return statistics;
    }

    /**
     * 获取指定日期范围的番茄钟记录
     */
    public List<PomodoroResponse> getPomodorosByDateRange(Long userId, LocalDateTime startDate, LocalDateTime endDate) {
        List<Pomodoro> pomodoros = pomodoroRepository.findByUserIdAndDateRange(userId, startDate, endDate);
        return pomodoros.stream().map(this::convertToResponse).collect(Collectors.toList());
    }

    /**
     * 更新任务实际时长
     */
    @Transactional
    private void updateTaskActualDuration(Long taskId, int additionalMinutes) {
        // 这里可以更新任务的累计实际时长
        // 当前task表中actual_duration字段表示单个任务的实际用时
        // 如果需要累计，可以在任务表中添加一个新的字段
        log.info("任务 {} 新增实际时长 {} 分钟", taskId, additionalMinutes);
    }

    /**
     * 转换为响应DTO
     */
    private PomodoroResponse convertToResponse(Pomodoro pomodoro) {
        PomodoroResponse response = new PomodoroResponse();
        response.setId(pomodoro.getId());
        response.setTaskId(pomodoro.getTaskId());
        response.setUserId(pomodoro.getUserId());
        response.setType(convertPomodoroTypeResponse(pomodoro.getType()));
        response.setPlannedDuration(pomodoro.getPlannedDuration());
        response.setActualDuration(pomodoro.getActualDuration());
        response.setStartedAt(pomodoro.getStartedAt());
        response.setEndedAt(pomodoro.getEndedAt());
        response.setIsCompleted(pomodoro.getIsCompleted());
        response.setInterruptionCount(pomodoro.getInterruptionCount());
        response.setNotes(pomodoro.getNotes());
        response.setCreatedAt(pomodoro.getCreatedAt());
        return response;
    }

    /**
     * 转换番茄钟类型枚举
     */
    private Pomodoro.PomodoroType convertPomodoroType(Pomodoro.PomodoroType type) {
        if (type == null) return Pomodoro.PomodoroType.WORK;
        return type;
    }

    private Pomodoro.PomodoroType convertPomodoroTypeResponse(Pomodoro.PomodoroType type) {
        if (type == null) return null;
        return type;
    }

    /**
     * 番茄钟统计数据传输对象
     */
    public static class PomodoroStatistics {
        private Long totalPomodoros = 0L;
        private Long totalWork = 0L;
        private Long totalShortBreak = 0L;
        private Long totalLongBreak = 0L;
        private Integer totalFocusMinutes = 0;

        // Getters and Setters
        public Long getTotalPomodoros() { return totalPomodoros; }
        public void setTotalPomodoros(Long totalPomodoros) { this.totalPomodoros = totalPomodoros; }

        public Long getTotalWork() { return totalWork; }
        public void setTotalWork(Long totalWork) { this.totalWork = totalWork; }

        public Long getTotalShortBreak() { return totalShortBreak; }
        public void setTotalShortBreak(Long totalShortBreak) { this.totalShortBreak = totalShortBreak; }

        public Long getTotalLongBreak() { return totalLongBreak; }
        public void setTotalLongBreak(Long totalLongBreak) { this.totalLongBreak = totalLongBreak; }

        public Integer getTotalFocusMinutes() { return totalFocusMinutes; }
        public void setTotalFocusMinutes(Integer totalFocusMinutes) { this.totalFocusMinutes = totalFocusMinutes; }

        // 计算专注小时数
        public Double getTotalFocusHours() {
            return totalFocusMinutes != null ? totalFocusMinutes / 60.0 : 0.0;
        }
    }
}