package com.tomato.todo.backend.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.tomato.todo.backend.dto.task.TaskCreateRequest;
import com.tomato.todo.backend.dto.task.TaskQueryRequest;
import com.tomato.todo.backend.dto.task.TaskResponse;
import com.tomato.todo.backend.dto.task.TaskUpdateRequest;
import com.tomato.todo.backend.entity.Task;
import com.tomato.todo.backend.entity.Tag;
import com.tomato.todo.backend.repository.TaskRepository;
import com.tomato.todo.backend.mapper.TagMapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 任务服务类
 *
 * @author Tomato Todo Team
 * @version 1.0.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final TagMapper tagMapper;

    /**
     * 创建任务
     */
    @Transactional
    public TaskResponse createTask(Long userId, TaskCreateRequest request) {
        log.info("创建任务，用户ID: {}, 任务标题: {}", userId, request.getTitle());

        Task task = new Task();
        task.setUserId(userId);
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setSummary(request.getSummary());
        task.setEstimatedDuration(request.getEstimatedDuration());
        task.setActualDuration(0);
        task.setCategoryId(request.getCategoryId());
        task.setPriority(request.getPriority());
        task.setStatus(request.getStatus());
        task.setDueDate(request.getDueDate());
        task.setReminderTime(request.getReminderTime());
        task.setStartTime(request.getStartTime());
        task.setEndTime(request.getEndTime());
        task.setTags(request.getTags());
        task.setSortOrder(request.getSortOrder());
        task.setParentTaskId(request.getParentTaskId());
        task.setIsRecurring(request.getIsRecurring());
        task.setRecurrenceRule(request.getRecurrenceRule());
        task.setCompletionRate(0.0);
        task.setCreatedAt(LocalDateTime.now());
        task.setUpdatedAt(LocalDateTime.now());

        taskRepository.insert(task);
        log.info("任务创建成功，ID: {}", task.getId());

        return convertToResponse(task);
    }

    /**
     * 更新任务
     */
    @Transactional
    public TaskResponse updateTask(Long userId, Long taskId, TaskUpdateRequest request) {
        log.info("更新任务，用户ID: {}, 任务ID: {}", userId, taskId);

        Task task = taskRepository.selectById(taskId);
        if (task == null || !task.getUserId().equals(userId)) {
            throw new RuntimeException("任务不存在或无权限访问");
        }

        // 更新字段
        if (request.getTitle() != null) {
            task.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            task.setDescription(request.getDescription());
        }
        if (request.getSummary() != null) {
            task.setSummary(request.getSummary());
        }
        if (request.getEstimatedDuration() != null) {
            task.setEstimatedDuration(request.getEstimatedDuration());
        }
        if (request.getActualDuration() != null) {
            task.setActualDuration(request.getActualDuration());
        }
        if (request.getCategoryId() != null) {
            task.setCategoryId(request.getCategoryId());
        }
        if (request.getPriority() != null) {
            task.setPriority(request.getPriority());
        }
        if (request.getStatus() != null) {
            task.setStatus(request.getStatus());

            // 如果任务状态变为已完成，设置完成时间
            if (request.getStatus() == Task.TaskStatus.COMPLETED && task.getCompletedAt() == null) {
                task.setCompletedAt(LocalDateTime.now());
                task.setCompletionRate(100.0);
            }
        }
        if (request.getDueDate() != null) {
            task.setDueDate(request.getDueDate());
        }
        if (request.getReminderTime() != null) {
            task.setReminderTime(request.getReminderTime());
        }
        if (request.getStartTime() != null) {
            task.setStartTime(request.getStartTime());
        }
        if (request.getEndTime() != null) {
            task.setEndTime(request.getEndTime());
        }
        if (request.getTags() != null) {
            task.setTags(request.getTags());
        }
        if (request.getSortOrder() != null) {
            task.setSortOrder(request.getSortOrder());
        }
        if (request.getParentTaskId() != null) {
            task.setParentTaskId(request.getParentTaskId());
        }
        if (request.getIsRecurring() != null) {
            task.setIsRecurring(request.getIsRecurring());
        }
        if (request.getRecurrenceRule() != null) {
            task.setRecurrenceRule(request.getRecurrenceRule());
        }
        if (request.getCompletionRate() != null) {
            task.setCompletionRate(request.getCompletionRate());
        }

        task.setUpdatedAt(LocalDateTime.now());
        taskRepository.updateById(task);

        log.info("任务更新成功，ID: {}", taskId);
        return convertToResponse(task);
    }

    /**
     * 删除任务（逻辑删除）
     */
    @Transactional
    public void deleteTask(Long userId, Long taskId) {
        log.info("删除任务，用户ID: {}, 任务ID: {}", userId, taskId);

        Task task = taskRepository.findByIdAndUserId(taskId, userId);
        if (task == null) {
            throw new RuntimeException("任务不存在或无权限访问");
        }

        // 使用 MyBatis Plus 的 deleteById 方法进行软删除
        taskRepository.deleteById(taskId);

        log.info("任务删除成功，ID: {}", taskId);
    }

    /**
     * 获取任务详情
     */
    public TaskResponse getTask(Long userId, Long taskId) {
        Task task = taskRepository.findByIdAndUserId(taskId, userId);
        if (task == null) {
            throw new RuntimeException("任务不存在或无权限访问");
        }
        return convertToResponse(task);
    }

    /**
     * 分页查询任务
     */
    public IPage<TaskResponse> getTasks(Long userId, TaskQueryRequest request) {
        log.info("查询任务列表，用户ID: {}, 页码: {}, 每页大小: {}", userId, request.getPageNum(), request.getPageSize());

        // 如果传入了标签ID，需要转换为标签名称进行查询
        List<String> tagNamesFromIds = null;
        if (request.getTagIds() != null && !request.getTagIds().isEmpty()) {
            tagNamesFromIds = convertTagIdsToNames(userId, request.getTagIds());
            log.info("将标签ID {} 转换为标签名称: {}", request.getTagIds(), tagNamesFromIds);
        }

        // 合并标签名称列表
        List<String> allTagNames = request.getTagNames();
        if (tagNamesFromIds != null && !tagNamesFromIds.isEmpty()) {
            if (allTagNames == null) {
                allTagNames = tagNamesFromIds;
            } else {
                allTagNames.addAll(tagNamesFromIds);
            }
        }

        Page<Task> page = new Page<>(request.getPageNum(), request.getPageSize());
        IPage<Task> taskPage = taskRepository.findByConditions(
            page,
            userId,
            request.getStatus(),
            request.getPriority(),
            request.getCategoryId(),
            request.getParentTaskId(),
            request.getKeyword(),
            request.getTodayOnly(),
            request.getOverdueOnly(),
            null, // tagIds不再需要，因为我们已经转换为tagNames
            allTagNames,
            request.getSortBy(),
            request.getSortDirection()
        );

        return taskPage.convert(this::convertToResponse);
    }

    /**
     * 根据状态查询任务
     */
    public List<TaskResponse> getTasksByStatus(Long userId, Task.TaskStatus status) {
        List<Task> tasks = taskRepository.findByUserIdAndStatus(userId, status);
        return tasks.stream().map(this::convertToResponse).collect(Collectors.toList());
    }

    /**
     * 根据优先级查询任务
     */
    public List<TaskResponse> getTasksByPriority(Long userId, Task.Priority priority) {
        List<Task> tasks = taskRepository.findByUserIdAndPriority(userId, priority);
        return tasks.stream().map(this::convertToResponse).collect(Collectors.toList());
    }

    /**
     * 根据分类查询任务
     */
    public List<TaskResponse> getTasksByCategory(Long userId, Long categoryId) {
        List<Task> tasks = taskRepository.findByUserIdAndCategoryId(userId, categoryId);
        return tasks.stream().map(this::convertToResponse).collect(Collectors.toList());
    }

    /**
     * 获取今日到期任务
     */
    public List<TaskResponse> getTodayDueTasks(Long userId) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfDay = now.withHour(0).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime endOfDay = now.withHour(23).withMinute(59).withSecond(59).withNano(999999999);

        List<Task> tasks = taskRepository.findTodayDueTasks(userId, startOfDay, endOfDay);
        return tasks.stream().map(this::convertToResponse).collect(Collectors.toList());
    }

    /**
     * 获取逾期任务
     */
    public List<TaskResponse> getOverdueTasks(Long userId) {
        List<Task> tasks = taskRepository.findOverdueTasks(userId, LocalDateTime.now());
        return tasks.stream().map(this::convertToResponse).collect(Collectors.toList());
    }

    /**
     * 搜索任务
     */
    public List<TaskResponse> searchTasks(Long userId, String keyword) {
        List<Task> tasks = taskRepository.searchTasks(userId, keyword);
        return tasks.stream().map(this::convertToResponse).collect(Collectors.toList());
    }

    /**
     * 获取子任务
     */
    public List<TaskResponse> getSubTasks(Long userId, Long parentTaskId) {
        List<Task> tasks = taskRepository.findSubTasks(userId, parentTaskId);
        return tasks.stream().map(this::convertToResponse).collect(Collectors.toList());
    }

    /**
     * 获取下一个待处理任务
     */
    public TaskResponse getNextPendingTask(Long userId) {
        Task task = taskRepository.findNextPendingTask(userId);
        return task != null ? convertToResponse(task) : null;
    }

    /**
     * 批量更新任务状态
     */
    @Transactional
    public void batchUpdateStatus(Long userId, List<Long> taskIds, Task.TaskStatus status) {
        log.info("批量更新任务状态，用户ID: {}, 任务数量: {}, 新状态: {}", userId, taskIds.size(), status);

        int updatedCount = taskRepository.batchUpdateStatus(userId, taskIds, status);
        log.info("批量更新完成，影响行数: {}", updatedCount);
    }

    /**
     * 统计任务数量
     */
    public long countTasksByStatus(Long userId, Task.TaskStatus status) {
        return taskRepository.countByUserIdAndStatus(userId, status);
    }

    /**
     * 将标签ID列表转换为标签名称列表
     */
    private List<String> convertTagIdsToNames(Long userId, List<Long> tagIds) {
        if (tagIds == null || tagIds.isEmpty()) {
            return null;
        }

        QueryWrapper<Tag> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("user_id", userId)
                   .in("id", tagIds)
                   .eq("deleted", 0);

        List<Tag> tags = tagMapper.selectList(queryWrapper);

        return tags.stream()
                   .map(Tag::getName)
                   .collect(Collectors.toList());
    }

    /**
     * 转换为响应DTO
     */
    private TaskResponse convertToResponse(Task task) {
        TaskResponse response = new TaskResponse();
        response.setId(task.getId());
        response.setUserId(task.getUserId());
        response.setCategoryId(task.getCategoryId());
        response.setTitle(task.getTitle());
        response.setDescription(task.getDescription());
        response.setSummary(task.getSummary());
        response.setEstimatedDuration(task.getEstimatedDuration());
        response.setActualDuration(task.getActualDuration());
        response.setPriority(task.getPriority());
        response.setStatus(task.getStatus());
        response.setDueDate(task.getDueDate());
        response.setReminderTime(task.getReminderTime());
        response.setStartTime(task.getStartTime());
        response.setEndTime(task.getEndTime());
        response.setTags(task.getTags());
        response.setSortOrder(task.getSortOrder());
        response.setParentTaskId(task.getParentTaskId());
        response.setIsRecurring(task.getIsRecurring());
        response.setRecurrenceRule(task.getRecurrenceRule());
        response.setCompletionRate(task.getCompletionRate());
        response.setCreatedAt(task.getCreatedAt());
        response.setUpdatedAt(task.getUpdatedAt());
        response.setCompletedAt(task.getCompletedAt());
        return response;
    }
}