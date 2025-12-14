package com.tomato.todo.backend.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tomato.todo.backend.dto.task.TaskCreateRequest;
import com.tomato.todo.backend.dto.task.TaskUpdateRequest;
import com.tomato.todo.backend.entity.Task;
import com.tomato.todo.backend.repository.TaskRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureWebMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;

/**
 * 任务控制器集成测试
 *
 * @author Tomato Todo Team
 * @version 1.0.0
 */
@SpringBootTest
@AutoConfigureWebMvc
@ActiveProfiles("test")
@Transactional
public class TaskControllerIntegrationTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private MockMvc mockMvc;
    private Long testUserId = 1L;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();

        // 清理测试数据
        taskRepository.delete(
                taskRepository.selectList(
                        new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<Task>()
                                .eq("user_id", testUserId)
                )
        );
    }

    @Test
    void testCreateTask() throws Exception {
        TaskCreateRequest request = new TaskCreateRequest();
        request.setTitle("测试任务");
        request.setDescription("这是一个测试任务");
        request.setEstimatedDuration(30);
        request.setPriority(TaskCreateRequest.Priority.MEDIUM);
        request.setStatus(TaskCreateRequest.TaskStatus.PENDING);

        mockMvc.perform(post("/api/tasks")
                .header("X-User-Id", testUserId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.title").value("测试任务"))
                .andExpect(jsonPath("$.data.description").value("这是一个测试任务"))
                .andExpect(jsonPath("$.data.estimatedDuration").value(30))
                .andExpect(jsonPath("$.data.status").value("PENDING"))
                .andExpect(jsonPath("$.data.priority").value("MEDIUM"));
    }

    @Test
    void testGetTask() throws Exception {
        // 创建测试任务
        Task task = createTestTask();

        mockMvc.perform(get("/api/tasks/{taskId}", task.getId())
                .header("X-User-Id", testUserId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.id").value(task.getId()))
                .andExpect(jsonPath("$.data.title").value("测试任务"));
    }

    @Test
    void testUpdateTask() throws Exception {
        // 创建测试任务
        Task task = createTestTask();

        TaskUpdateRequest request = new TaskUpdateRequest();
        request.setTitle("更新后的任务标题");
        request.setStatus(TaskUpdateRequest.TaskStatus.IN_PROGRESS);

        mockMvc.perform(put("/api/tasks/{taskId}", task.getId())
                .header("X-User-Id", testUserId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpected(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.title").value("更新后的任务标题"))
                .andExpect(jsonPath("$.data.status").value("IN_PROGRESS"));
    }

    @Test
    void testDeleteTask() throws Exception {
        // 创建测试任务
        Task task = createTestTask();

        mockMvc.perform(delete("/api/tasks/{taskId}", task.getId())
                .header("X-User-Id", testUserId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));

        // 验证任务已被软删除
        Task deletedTask = taskRepository.selectById(task.getId());
        assert deletedTask != null && deletedTask.getDeleted();
    }

    @Test
    void testGetTasksWithPagination() throws Exception {
        // 创建多个测试任务
        for (int i = 0; i < 15; i++) {
            createTestTask("任务 " + i);
        }

        mockMvc.perform(get("/api/tasks")
                .header("X-User-Id", testUserId)
                .param("pageNum", "1")
                .param("pageSize", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.records", hasSize(10)))
                .andExpect(jsonPath("$.data.total").value(15))
                .andExpect(jsonPath("$.data.current").value(1))
                .andExpect(jsonPath("$.data.size").value(10));
    }

    @Test
    void testGetTasksByStatus() throws Exception {
        // 创建不同状态的任务
        Task pendingTask = createTestTask("待处理任务");
        Task completedTask = createTestTask("已完成任务");
        completedTask.setStatus(Task.TaskStatus.COMPLETED);
        taskRepository.updateById(completedTask);

        mockMvc.perform(get("/api/tasks/status/{status}", "COMPLETED")
                .header("X-User-Id", testUserId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.[0].title").value("已完成任务"));
    }

    @Test
    void testSearchTasks() throws Exception {
        // 创建测试任务
        createTestTask("编程学习任务");
        createTestTask("英语学习任务");
        createTestTask("运动健身计划");

        mockMvc.perform(get("/api/tasks/search")
                .header("X-User-Id", testUserId)
                .param("keyword", "学习"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data", hasSize(2)));
    }

    @Test
    void testGetTaskStatistics() throws Exception {
        // 创建测试任务
        createTestTask("任务1");
        createTestTask("任务2");
        createTestTask("任务3");

        Task completedTask = createTestTask("已完成任务");
        completedTask.setStatus(Task.TaskStatus.COMPLETED);
        taskRepository.updateById(completedTask);

        mockMvc.perform(get("/api/tasks/statistics")
                .header("X-User-Id", testUserId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.totalPending").value(3))
                .andExpect(jsonPath("$.data.totalCompleted").value(1));
    }

    @Test
    void testCreateTaskWithInvalidData() throws Exception {
        TaskCreateRequest request = new TaskCreateRequest();
        // 不设置必填字段

        mockMvc.perform(post("/api/tasks")
                .header("X-User-Id", testUserId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testUnauthorizedAccess() throws Exception {
        mockMvc.perform(get("/api/tasks"))
                .andExpect(status().isBadRequest());
    }

    /**
     * 创建测试任务的辅助方法
     */
    private Task createTestTask() {
        return createTestTask("测试任务");
    }

    private Task createTestTask(String title) {
        Task task = new Task();
        task.setUserId(testUserId);
        task.setTitle(title);
        task.setDescription("测试任务描述");
        task.setEstimatedDuration(30);
        task.setPriority(Task.Priority.MEDIUM);
        task.setStatus(Task.TaskStatus.PENDING);
        task.setCreatedAt(java.time.LocalDateTime.now());
        task.setUpdatedAt(java.time.LocalDateTime.now());
        taskRepository.insert(task);
        return task;
    }
}