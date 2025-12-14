package com.tomato.todo.backend.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.tomato.todo.backend.common.ApiResponse;
import com.tomato.todo.backend.dto.task.TaskCreateRequest;
import com.tomato.todo.backend.dto.task.TaskQueryRequest;
import com.tomato.todo.backend.dto.task.TaskResponse;
import com.tomato.todo.backend.dto.task.TaskUpdateRequest;
import com.tomato.todo.backend.entity.Task;
import com.tomato.todo.backend.service.TaskService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

/**
 * 任务管理控制器
 *
 * @author Tomato Todo Team
 * @version 1.0.0
 */
@Slf4j
@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
@Tag(name = "任务管理", description = "任务的增删改查和状态管理")
@CrossOrigin(origins = {
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000"
}, allowedHeaders = "*", methods = {
    RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT,
    RequestMethod.DELETE, RequestMethod.PATCH, RequestMethod.OPTIONS, RequestMethod.HEAD
}, allowCredentials = "true", maxAge = 3600)
public class TaskController {

    private final TaskService taskService;

    /**
     * 创建任务
     */
    @PostMapping
    @Operation(summary = "创建任务", description = "创建新的待办任务")
    public ResponseEntity<ApiResponse<TaskResponse>> createTask(
            @Parameter(hidden = true) @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody TaskCreateRequest request) {
        log.info("创建任务请求，用户ID: {}", userId);

        TaskResponse response = taskService.createTask(userId, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 更新任务
     */
    @PutMapping("/{taskId}")
    @Operation(summary = "更新任务", description = "更新指定任务的信息")
    public ResponseEntity<ApiResponse<TaskResponse>> updateTask(
            @Parameter(hidden = true) @RequestHeader("X-User-Id") Long userId,
            @Parameter(description = "任务ID") @PathVariable Long taskId,
            @Valid @RequestBody TaskUpdateRequest request) {
        log.info("更新任务请求，用户ID: {}, 任务ID: {}", userId, taskId);

        TaskResponse response = taskService.updateTask(userId, taskId, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 删除任务
     */
    @DeleteMapping("/{taskId}")
    @Operation(summary = "删除任务", description = "删除指定任务（逻辑删除）")
    public ResponseEntity<ApiResponse<Void>> deleteTask(
            @Parameter(hidden = true) @RequestHeader("X-User-Id") Long userId,
            @Parameter(description = "任务ID") @PathVariable Long taskId) {
        log.info("删除任务请求，用户ID: {}, 任务ID: {}", userId, taskId);

        taskService.deleteTask(userId, taskId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    /**
     * 获取任务详情
     */
    @GetMapping("/{taskId}")
    @Operation(summary = "获取任务详情", description = "根据ID获取任务的详细信息")
    public ResponseEntity<ApiResponse<TaskResponse>> getTask(
            @Parameter(hidden = true) @RequestHeader("X-User-Id") Long userId,
            @Parameter(description = "任务ID") @PathVariable Long taskId) {
        log.info("获取任务详情，用户ID: {}, 任务ID: {}", userId, taskId);

        TaskResponse response = taskService.getTask(userId, taskId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 分页查询任务列表
     */
    @GetMapping
    @Operation(summary = "获取任务列表", description = "分页查询用户的任务列表")
    public ResponseEntity<ApiResponse<IPage<TaskResponse>>> getTasks(
            @Parameter(hidden = true) @RequestHeader("X-User-Id") Long userId,
            @Valid @ModelAttribute TaskQueryRequest request) {
        log.info("查询任务列表，用户ID: {}", userId);

        IPage<TaskResponse> response = taskService.getTasks(userId, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 根据状态查询任务
     */
    @GetMapping("/status/{status}")
    @Operation(summary = "按状态查询任务", description = "根据任务状态查询任务列表")
    public ResponseEntity<ApiResponse<List<TaskResponse>>> getTasksByStatus(
            @Parameter(hidden = true) @RequestHeader("X-User-Id") Long userId,
            @Parameter(description = "任务状态") @PathVariable Task.TaskStatus status) {
        log.info("按状态查询任务，用户ID: {}, 状态: {}", userId, status);

        List<TaskResponse> response = taskService.getTasksByStatus(userId, status);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 根据优先级查询任务
     */
    @GetMapping("/priority/{priority}")
    @Operation(summary = "按优先级查询任务", description = "根据任务优先级查询任务列表")
    public ResponseEntity<ApiResponse<List<TaskResponse>>> getTasksByPriority(
            @Parameter(hidden = true) @RequestHeader("X-User-Id") Long userId,
            @Parameter(description = "任务优先级") @PathVariable Task.Priority priority) {
        log.info("按优先级查询任务，用户ID: {}, 优先级: {}", userId, priority);

        List<TaskResponse> response = taskService.getTasksByPriority(userId, priority);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 根据分类查询任务
     */
    @GetMapping("/category/{categoryId}")
    @Operation(summary = "按分类查询任务", description = "根据任务分类查询任务列表")
    public ResponseEntity<ApiResponse<List<TaskResponse>>> getTasksByCategory(
            @Parameter(hidden = true) @RequestHeader("X-User-Id") Long userId,
            @Parameter(description = "分类ID") @PathVariable Long categoryId) {
        log.info("按分类查询任务，用户ID: {}, 分类ID: {}", userId, categoryId);

        List<TaskResponse> response = taskService.getTasksByCategory(userId, categoryId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 获取今日到期任务
     */
    @GetMapping("/today-due")
    @Operation(summary = "获取今日到期任务", description = "查询今天到期的所有任务")
    public ResponseEntity<ApiResponse<List<TaskResponse>>> getTodayDueTasks(
            @Parameter(hidden = true) @RequestHeader("X-User-Id") Long userId) {
        log.info("获取今日到期任务，用户ID: {}", userId);

        List<TaskResponse> response = taskService.getTodayDueTasks(userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 获取逾期任务
     */
    @GetMapping("/overdue")
    @Operation(summary = "获取逾期任务", description = "查询所有逾期的任务")
    public ResponseEntity<ApiResponse<List<TaskResponse>>> getOverdueTasks(
            @Parameter(hidden = true) @RequestHeader("X-User-Id") Long userId) {
        log.info("获取逾期任务，用户ID: {}", userId);

        List<TaskResponse> response = taskService.getOverdueTasks(userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 搜索任务
     */
    @GetMapping("/search")
    @Operation(summary = "搜索任务", description = "根据关键词搜索任务")
    public ResponseEntity<ApiResponse<List<TaskResponse>>> searchTasks(
            @Parameter(hidden = true) @RequestHeader("X-User-Id") Long userId,
            @Parameter(description = "搜索关键词") @RequestParam String keyword) {
        log.info("搜索任务，用户ID: {}, 关键词: {}", userId, keyword);

        List<TaskResponse> response = taskService.searchTasks(userId, keyword);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 获取子任务
     */
    @GetMapping("/{parentTaskId}/subtasks")
    @Operation(summary = "获取子任务", description = "查询指定任务的所有子任务")
    public ResponseEntity<ApiResponse<List<TaskResponse>>> getSubTasks(
            @Parameter(hidden = true) @RequestHeader("X-User-Id") Long userId,
            @Parameter(description = "父任务ID") @PathVariable Long parentTaskId) {
        log.info("获取子任务，用户ID: {}, 父任务ID: {}", userId, parentTaskId);

        List<TaskResponse> response = taskService.getSubTasks(userId, parentTaskId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 获取下一个待处理任务
     */
    @GetMapping("/next")
    @Operation(summary = "获取下一个待处理任务", description = "获取用户下一个应该处理的任务")
    public ResponseEntity<ApiResponse<TaskResponse>> getNextPendingTask(
            @Parameter(hidden = true) @RequestHeader("X-User-Id") Long userId) {
        log.info("获取下一个待处理任务，用户ID: {}", userId);

        TaskResponse response = taskService.getNextPendingTask(userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 批量更新任务状态
     */
    @PutMapping("/batch-status")
    @Operation(summary = "批量更新状态", description = "批量更新多个任务的状态")
    public ResponseEntity<ApiResponse<Void>> batchUpdateStatus(
            @Parameter(hidden = true) @RequestHeader("X-User-Id") Long userId,
            @Parameter(description = "任务ID列表") @RequestParam List<Long> taskIds,
            @Parameter(description = "新状态") @RequestParam Task.TaskStatus status) {
        log.info("批量更新任务状态，用户ID: {}, 任务数量: {}, 新状态: {}", userId, taskIds.size(), status);

        taskService.batchUpdateStatus(userId, taskIds, status);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    /**
     * 获取任务统计
     */
    @GetMapping("/statistics")
    @Operation(summary = "获取任务统计", description = "获取用户任务的统计数据")
    public ResponseEntity<ApiResponse<TaskStatistics>> getTaskStatistics(
            @Parameter(hidden = true) @RequestHeader("X-User-Id") Long userId) {
        log.info("获取任务统计，用户ID: {}", userId);

        TaskStatistics statistics = new TaskStatistics();
        statistics.setTotalPending(taskService.countTasksByStatus(userId, Task.TaskStatus.PENDING));
        statistics.setTotalInProgress(taskService.countTasksByStatus(userId, Task.TaskStatus.IN_PROGRESS));
        statistics.setTotalCompleted(taskService.countTasksByStatus(userId, Task.TaskStatus.COMPLETED));
        statistics.setTotalPaused(taskService.countTasksByStatus(userId, Task.TaskStatus.PAUSED));
        statistics.setTotalCancelled(taskService.countTasksByStatus(userId, Task.TaskStatus.CANCELLED));

        List<TaskResponse> todayDueTasks = taskService.getTodayDueTasks(userId);
        statistics.setTotalTodayDue((long) todayDueTasks.size());

        List<TaskResponse> overdueTasks = taskService.getOverdueTasks(userId);
        statistics.setTotalOverdue((long) overdueTasks.size());

        return ResponseEntity.ok(ApiResponse.success(statistics));
    }

    /**
     * 任务统计数据传输对象
     */
    public static class TaskStatistics {
        private Long totalPending;
        private Long totalInProgress;
        private Long totalCompleted;
        private Long totalPaused;
        private Long totalCancelled;
        private Long totalTodayDue;
        private Long totalOverdue;

        // Getters and Setters
        public Long getTotalPending() { return totalPending; }
        public void setTotalPending(Long totalPending) { this.totalPending = totalPending; }

        public Long getTotalInProgress() { return totalInProgress; }
        public void setTotalInProgress(Long totalInProgress) { this.totalInProgress = totalInProgress; }

        public Long getTotalCompleted() { return totalCompleted; }
        public void setTotalCompleted(Long totalCompleted) { this.totalCompleted = totalCompleted; }

        public Long getTotalPaused() { return totalPaused; }
        public void setTotalPaused(Long totalPaused) { this.totalPaused = totalPaused; }

        public Long getTotalCancelled() { return totalCancelled; }
        public void setTotalCancelled(Long totalCancelled) { this.totalCancelled = totalCancelled; }

        public Long getTotalTodayDue() { return totalTodayDue; }
        public void setTotalTodayDue(Long totalTodayDue) { this.totalTodayDue = totalTodayDue; }

        public Long getTotalOverdue() { return totalOverdue; }
        public void setTotalOverdue(Long totalOverdue) { this.totalOverdue = totalOverdue; }
    }
}