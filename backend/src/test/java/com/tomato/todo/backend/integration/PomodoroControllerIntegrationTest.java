package com.tomato.todo.backend.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tomato.todo.backend.dto.pomodoro.PomodoroStartRequest;
import com.tomato.todo.backend.dto.pomodoro.PomodoroStopRequest;
import com.tomato.todo.backend.entity.Pomodoro;
import com.tomato.todo.backend.entity.Task;
import com.tomato.todo.backend.repository.PomodoroRepository;
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

import java.time.LocalDateTime;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;

/**
 * 番茄钟控制器集成测试
 *
 * @author Tomato Todo Team
 * @version 1.0.0
 */
@SpringBootTest
@AutoConfigureWebMvc
@ActiveProfiles("test")
@Transactional
public class PomodoroControllerIntegrationTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private PomodoroRepository pomodoroRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private MockMvc mockMvc;
    private Long testUserId = 1L;
    private Task testTask;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();

        // 清理测试数据
        pomodoroRepository.delete(
                pomodoroRepository.selectList(
                        new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<Pomodoro>()
                                .eq("user_id", testUserId)
                )
        );
        taskRepository.delete(
                taskRepository.selectList(
                        new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<Task>()
                                .eq("user_id", testUserId)
                )
        );

        // 创建测试任务
        testTask = createTestTask();
    }

    @Test
    void testStartPomodoro() throws Exception {
        PomodoroStartRequest request = new PomodoroStartRequest();
        request.setTaskId(testTask.getId());
        request.setType(PomodoroStartRequest.PomodoroType.WORK);
        request.setPlannedDuration(25);
        request.setNotes("开始专注工作");

        mockMvc.perform(post("/api/pomodoro/start")
                .header("X-User-Id", testUserId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.taskId").value(testTask.getId()))
                .andExpect(jsonPath("$.data.type").value("WORK"))
                .andExpect(jsonPath("$.data.plannedDuration").value(25))
                .andExpect(jsonPath("$.data.isCompleted").value(false))
                .andExpect(jsonPath("$.data.endedAt").doesNotExist());
    }

    @Test
    void testStopPomodoro() throws Exception {
        // 先开始一个番茄钟
        Pomodoro pomodoro = startTestPomodoro();

        PomodoroStopRequest request = new PomodoroStopRequest();
        request.setInterruptionCount(2);
        request.setIsCompleted(true);
        request.setNotes("任务完成");

        mockMvc.perform(post("/api/pomodoro/{pomodoroId}/stop", pomodoro.getId())
                .header("X-User-Id", testUserId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.id").value(pomodoro.getId()))
                .andExpect(jsonPath("$.data.isCompleted").value(true))
                .andExpect(jsonPath("$.data.interruptionCount").value(2))
                .andExpect(jsonPath("$.data.endedAt").exists())
                .andExpect(jsonPath("$.data.actualDuration").isNumber());
    }

    @Test
    void testGetActivePomodoro() throws Exception {
        // 开始一个番茄钟
        startTestPomodoro();

        mockMvc.perform(get("/api/pomodoro/active")
                .header("X-User-Id", testUserId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").isMap())
                .andExpect(jsonPath("$.data.isCompleted").value(false))
                .andExpect(jsonPath("$.data.endedAt").doesNotExist());
    }

    @Test
    void testGetTodayPomodoros() throws Exception {
        // 创建今日番茄钟记录
        createTestPomodoro(LocalDateTime.now(), true);
        createTestPomodoro(LocalDateTime.now(), false);

        mockMvc.perform(get("/api/pomodoro/today")
                .header("X-User-Id", testUserId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data", hasSize(2)));
    }

    @Test
    void testGetPomodorosByTaskId() throws Exception {
        // 为测试任务创建番茄钟记录
        createTestPomodoro(LocalDateTime.now(), true);
        createTestPomodoro(LocalDateTime.now().minusMinutes(30), true);

        mockMvc.perform(get("/api/pomodoro/task/{taskId}", testTask.getId())
                .header("X-User-Id", testUserId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data", hasSize(2)));
    }

    @Test
    void testGetTodayStatistics() throws Exception {
        // 创建今日番茄钟记录
        for (int i = 0; i < 3; i++) {
            createTestPomodoro(LocalDateTime.now().minusMinutes(i * 30), true);
        }
        createTestPomodoro(LocalDateTime.now().minusMinutes(120), false);

        mockMvc.perform(get("/api/pomodoro/statistics/today")
                .header("X-User-Id", testUserId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.totalWork").value(3))
                .andExpect(jsonPath("$.data.totalFocusMinutes").value(greaterThan(0)));
    }

    @Test
    void testStartPomodoroWithoutTask() throws Exception {
        PomodoroStartRequest request = new PomodoroStartRequest();
        request.setTaskId(999L); // 不存在的任务ID
        request.setType(PomodoroStartRequest.PomodoroType.WORK);
        request.setPlannedDuration(25);

        mockMvc.perform(post("/api/pomodoro/start")
                .header("X-User-Id", testUserId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testStartMultiplePomodoros() throws Exception {
        // 开始第一个番茄钟
        startTestPomodoro();

        // 尝试开始第二个番茄钟（应该失败）
        PomodoroStartRequest request = new PomodoroStartRequest();
        request.setTaskId(testTask.getId());
        request.setType(PomodoroStartRequest.PomodoroType.WORK);
        request.setPlannedDuration(25);

        mockMvc.perform(post("/api/pomodoro/start")
                .header("X-User-Id", testUserId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testStopNonExistentPomodoro() throws Exception {
        PomodoroStopRequest request = new PomodoroStopRequest();
        request.setIsCompleted(true);

        mockMvc.perform(post("/api/pomodoro/{pomodoroId}/stop", 999L)
                .header("X-User-Id", testUserId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testGetPomodorosWithPagination() throws Exception {
        // 创建多个番茄钟记录
        for (int i = 0; i < 15; i++) {
            createTestPomodoro(LocalDateTime.now().minusMinutes(i * 30), i % 2 == 0);
        }

        mockMvc.perform(get("/api/pomodoro")
                .header("X-User-Id", testUserId)
                .param("pageNum", "1")
                .param("pageSize", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.records", hasSize(10)))
                .andExpect(jsonPath("$.data.total").value(15));
    }

    /**
     * 创建测试任务的辅助方法
     */
    private Task createTestTask() {
        Task task = new Task();
        task.setUserId(testUserId);
        task.setTitle("测试任务");
        task.setDescription("测试任务描述");
        task.setEstimatedDuration(30);
        task.setPriority(Task.Priority.MEDIUM);
        task.setStatus(Task.TaskStatus.PENDING);
        task.setCreatedAt(LocalDateTime.now());
        task.setUpdatedAt(LocalDateTime.now());
        taskRepository.insert(task);
        return task;
    }

    /**
     * 开始测试番茄钟的辅助方法
     */
    private Pomodoro startTestPomodoro() {
        return createTestPomodoro(LocalDateTime.now(), false);
    }

    /**
     * 创建测试番茄钟的辅助方法
     */
    private Pomodoro createTestPomodoro(LocalDateTime startedAt, boolean isCompleted) {
        Pomodoro pomodoro = new Pomodoro();
        pomodoro.setTaskId(testTask.getId());
        pomodoro.setUserId(testUserId);
        pomodoro.setType(Pomodoro.PomodoroType.WORK);
        pomodoro.setPlannedDuration(25);
        pomodoro.setActualDuration(isCompleted ? 25 : 0);
        pomodoro.setStartedAt(startedAt);
        pomodoro.setEndedAt(isCompleted ? startedAt.plusMinutes(25) : null);
        pomodoro.setIsCompleted(isCompleted);
        pomodoro.setInterruptionCount(0);
        pomodoro.setCreatedAt(LocalDateTime.now());
        pomodoroRepository.insert(pomodoro);
        return pomodoro;
    }
}