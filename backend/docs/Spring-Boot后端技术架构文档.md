# 番茄闹钟 - Spring Boot 后端技术架构文档

## 📋 目录
1. [项目概述](#项目概述)
2. [技术栈详解](#技术栈详解)
3. [项目结构分析](#项目结构分析)
4. [Spring Boot 架构设计](#spring-boot-架构设计)
5. [数据库设计](#数据库设计)
6. [API 设计与实现](#api-设计与实现)
7. [服务层架构](#服务层架构)
8. [数据访问层](#数据访问层)
9. [安全配置与认证](#安全配置与认证)
10. [配置管理](#配置管理)
11. [开发与部署](#开发与部署)
12. [最佳实践](#最佳实践)
13. [常见问题与解决方案](#常见问题与解决方案)

---

## 🎯 项目概述

番茄闹钟后端是基于 Spring Boot 3.1.5 的现代化 Java 后端应用，为番茄闹钟桌面应用提供完整的 API 服务支持。项目采用分层架构设计，实现了待办事项管理、番茄工作法计时、用户认证、统计分析等核心功能。

### 核心功能
- 📝 **任务管理** - 创建、编辑、删除和分类待办事项
- 🍅 **番茄计时** - 番茄工作法计时记录和统计
- 👤 **用户认证** - 用户注册、登录和权限管理
- 📊 **统计分析** - 任务完成情况和时间统计分析
- 🏷️ **标签管理** - 任务标签的创建和管理
- ⚙️ **系统管理** - 配置管理和系统监控

---

## 🛠️ 技术栈详解

### 核心框架
| 技术 | 版本 | 用途 |
|-----|------|------|
| **Spring Boot** | 3.1.5 | 应用框架，提供自动配置和依赖管理 |
| **Spring Security** | 6.1.5 | 安全框架，提供认证和授权 |
| **Spring Web** | 6.0.13 | Web框架，提供RESTful API支持 |
| **Spring Scheduling** | 6.0.13 | 定时任务支持 |

### 数据层技术
| 技术 | 版本 | 用途 |
|-----|------|------|
| **MyBatis Plus** | 3.5.3.2 | ORM框架，简化数据库操作 |
| **MySQL** | 8.0.33 | 关系型数据库 |
| **HikariCP** | 内置 | 高性能数据库连接池 |
| **Flyway** | 内置 | 数据库版本管理 |

### 工具库
| 技术 | 版本 | 用途 |
|-----|------|------|
| **Lombok** | 1.18.30 | 简化Java代码编写 |
| **Jackson** | 2.15.2 | JSON序列化和反序列化 |
| **Swagger/OpenAPI** | 3.0 | API文档生成 |
| **JWT** | 自定义 | 用户认证Token |
| **SLF4J + Logback** | 内置 | 日志记录框架 |

### 构建与部署
| 技术 | 版本 | 用途 |
|-----|------|------|
| **Maven** | 3.9.6 | 项目构建和依赖管理 |
| **Java** | 17 | 开发语言 |
| **Spring Boot Actuator** | 内置 | 应用监控和管理 |
| **Prometheus** | 内置 | 指标收集 |

---

## 📁 项目结构分析

```
backend/
├── src/
│   ├── main/
│   │   ├── java/com/tomato/todo/backend/
│   │   │   ├── TodoApplication.java        # 应用程序入口
│   │   │   ├── common/                     # 通用组件
│   │   │   │   └── ApiResponse.java        # 统一API响应格式
│   │   │   ├── config/                     # 配置类
│   │   │   │   ├── SecurityConfig.java     # 安全配置
│   │   │   │   ├── WebConfig.java          # Web配置
│   │   │   │   └── CorsConfig.java         # CORS配置
│   │   │   ├── controller/                 # 控制器层
│   │   │   │   ├── TaskController.java     # 任务管理
│   │   │   │   ├── PomodoroController.java # 番茄钟管理
│   │   │   │   ├── AuthenticationController.java # 认证管理
│   │   │   │   ├── StatisticsController.java # 统计分析
│   │   │   │   └── DictController.java     # 字典管理
│   │   │   ├── dto/                        # 数据传输对象
│   │   │   │   ├── task/                   # 任务相关DTO
│   │   │   │   ├── pomodoro/               # 番茄钟相关DTO
│   │   │   │   ├── auth/                   # 认证相关DTO
│   │   │   │   └── statistics/             # 统计相关DTO
│   │   │   ├── entity/                     # 实体类
│   │   │   │   ├── Task.java               # 任务实体
│   │   │   │   ├── User.java               # 用户实体
│   │   │   │   ├── Pomodoro.java           # 番茄钟实体
│   │   │   │   └── Tag.java                # 标签实体
│   │   │   ├── repository/                 # 数据访问层
│   │   │   │   ├── TaskRepository.java     # 任务数据访问
│   │   │   │   ├── UserRepository.java     # 用户数据访问
│   │   │   │   └── PomodoroRepository.java # 番茄钟数据访问
│   │   │   ├── service/                    # 服务层
│   │   │   │   ├── TaskService.java        # 任务服务
│   │   │   │   ├── UserService.java        # 用户服务
│   │   │   │   ├── PomodoroService.java    # 番茄钟服务
│   │   │   │   └── StatisticsService.java  # 统计服务
│   │   │   ├── handler/                    # MyBatis类型处理器
│   │   │   ├── mapper/                     # MyBatis映射器
│   │   │   ├── exception/                  # 异常处理
│   │   │   └── utils/                      # 工具类
│   │   └── resources/
│   │       ├── application.yml             # 应用配置
│   │       └── db/migration/               # 数据库迁移脚本
│   └── test/                              # 测试代码
├── docs/                                  # 项目文档
├── pom.xml                               # Maven配置
└── target/                               # 构建输出
```

### 关键配置文件

#### pom.xml 核心依赖
```xml
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>3.1.5</version>
</parent>

<dependencies>
    <!-- Spring Boot Starters -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jdbc</artifactId>
    </dependency>

    <!-- MyBatis Plus -->
    <dependency>
        <groupId>com.baomidou</groupId>
        <artifactId>mybatis-plus-boot-starter</artifactId>
        <version>3.5.3.2</version>
    </dependency>

    <!-- Database -->
    <dependency>
        <groupId>mysql</groupId>
        <artifactId>mysql-connector-java</artifactId>
    </dependency>
</dependencies>
```

---

## ⚡ Spring Boot 架构设计

### 应用程序入口

#### TodoApplication.java
```java
@SpringBootApplication
@MapperScan("com.tomato.todo.backend.mapper")  // MyBatis映射器扫描
@EnableAsync                                   // 启用异步支持
@EnableScheduling                              // 启用定时任务
public class TodoApplication {
    public static void main(String[] args) {
        SpringApplication.run(TodoApplication.class, args);
    }
}
```

**关键注解说明：**
- `@SpringBootApplication`：复合注解，包含自动配置、组件扫描等
- `@MapperScan`：指定MyBatis映射器接口的扫描路径
- `@EnableAsync`：启用方法级异步执行支持
- `@EnableScheduling`：启用Spring的定时任务功能

### 分层架构设计

项目采用经典的三层架构模式：

1. **Controller层** - 处理HTTP请求，参数验证，调用服务层
2. **Service层** - 业务逻辑处理，事务管理
3. **Repository层** - 数据访问，与数据库交互

#### Controller层设计模式
```java
@RestController
@RequestMapping("/tasks")
@RequiredArgsConstructor
@Tag(name = "任务管理", description = "任务的增删改查和状态管理")
@CrossOrigin(origins = {"http://localhost:3003"})
public class TaskController {

    private final TaskService taskService;

    @PostMapping
    @Operation(summary = "创建任务")
    public ResponseEntity<ApiResponse<TaskResponse>> createTask(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody TaskCreateRequest request) {
        TaskResponse response = taskService.createTask(userId, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
```

**设计特点：**
- 使用 `@RestController` 定义RESTful控制器
- `@RequiredArgsConstructor` 通过Lombok实现依赖注入
- 统一的API响应格式 `ApiResponse<T>`
- 集成Swagger文档注解
- CORS跨域支持

---

## 🗄️ 数据库设计

### 实体设计

#### 1. Task 实体 - 任务管理
```java
@Data
@TableName("t_task")
public class Task {
    @TableId(type = IdType.AUTO)
    private Long id;

    @TableField("user_id")
    private Long userId;

    private String title;
    private String description;

    @TableField(value = "priority", typeHandler = TaskPriorityTypeHandler.class)
    private Priority priority;

    @TableField(value = "status", typeHandler = TaskStatusTypeHandler.class)
    private TaskStatus status;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime dueDate;

    @TableLogic
    private Boolean deleted;

    // 枚举定义
    public enum Priority {
        LOW("low", "低"),
        MEDIUM("medium", "中"),
        HIGH("high", "高");
    }

    public enum TaskStatus {
        PENDING("pending", "待处理"),
        IN_PROGRESS("in_progress", "进行中"),
        COMPLETED("completed", "已完成"),
        PAUSED("paused", "已暂停"),
        CANCELLED("cancelled", "已取消");
    }
}
```

#### 2. User 实体 - 用户管理
```java
@Data
@TableName("t_user")
public class User {
    @TableId(type = IdType.AUTO)
    private Long id;

    private String username;
    private String email;
    private String passwordHash;
    private String nickname;
    private String avatarUrl;

    @TableLogic
    private Boolean deleted;
}
```

#### 3. Pomodoro 实体 - 番茄钟记录
```java
@Data
@TableName("t_pomodoro")
public class Pomodoro {
    @TableId(type = IdType.AUTO)
    private Long id;

    @TableField("task_id")
    private Long taskId;

    @TableField("user_id")
    private Long userId;

    private PomodoroType type;
    private Integer plannedDuration;
    private Integer actualDuration;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime startedAt;

    @TableLogic
    private Boolean deleted;

    public enum PomodoroType {
        WORK("work", "工作时间"),
        SHORT_BREAK("short_break", "短休息"),
        LONG_BREAK("long_break", "长休息");
    }
}
```

### 数据库特性

1. **逻辑删除**：使用 `@TableLogic` 注解实现软删除
2. **枚举类型处理**：通过自定义TypeHandler处理枚举类型
3. **时间格式化**：使用Jackson注解统一时间格式
4. **自动填充**：创建时间、更新时间自动管理

---

## 🌐 API 设计与实现

### RESTful API 设计原则

#### 1. 统一URL命名规范
```
GET    /api/v1/tasks           # 获取任务列表
POST   /api/v1/tasks           # 创建新任务
GET    /api/v1/tasks/{id}      # 获取指定任务
PUT    /api/v1/tasks/{id}      # 更新指定任务
DELETE /api/v1/tasks/{id}      # 删除指定任务
PATCH  /api/v1/tasks/{id}/status # 更新任务状态
```

#### 2. 统一响应格式
```java
@Data
public class ApiResponse<T> {
    private int code;
    private String message;
    private T data;
    private long timestamp;

    public static <T> ApiResponse<T> success(T data) {
        ApiResponse<T> response = new ApiResponse<>();
        response.setCode(200);
        response.setMessage("success");
        response.setData(data);
        response.setTimestamp(System.currentTimeMillis());
        return response;
    }

    public static <T> ApiResponse<T> error(int code, String message) {
        ApiResponse<T> response = new ApiResponse<>();
        response.setCode(code);
        response.setMessage(message);
        response.setTimestamp(System.currentTimeMillis());
        return response;
    }
}
```

### API 控制器实现

#### TaskController - 任务管理API
```java
@Slf4j
@RestController
@RequestMapping("/tasks")
@RequiredArgsConstructor
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

        TaskResponse response = taskService.createTask(userId, request);
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

        IPage<TaskResponse> response = taskService.getTasks(userId, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 按状态查询任务
     */
    @GetMapping("/status/{status}")
    @Operation(summary = "按状态查询任务", description = "根据任务状态查询任务列表")
    public ResponseEntity<ApiResponse<List<TaskResponse>>> getTasksByStatus(
            @Parameter(hidden = true) @RequestHeader("X-User-Id") Long userId,
            @Parameter(description = "任务状态") @PathVariable Task.TaskStatus status) {

        List<TaskResponse> response = taskService.getTasksByStatus(userId, status);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
```

#### AuthenticationController - 认证API
```java
@RestController
@RequestMapping("/auth")
public class AuthenticationController {

    /**
     * 用户登录
     */
    @PostMapping("/login")
    @Operation(summary = "用户登录", description = "用户身份验证")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@RequestBody LoginRequest request) {

        // 创建认证响应（实际应用中需要验证用户名和密码）
        AuthResponse authResponse = new AuthResponse();
        authResponse.setAccessToken(UUID.randomUUID().toString().replace("-", ""));
        authResponse.setUserId(2L);
        authResponse.setUsername(request.getUsername());
        authResponse.setExpiresAt(LocalDateTime.now().plusDays(1));

        return ResponseEntity.ok(ApiResponse.success(authResponse));
    }

    /**
     * 用户注册
     */
    @PostMapping("/register")
    @Operation(summary = "用户注册", description = "创建新用户账户")
    public ResponseEntity<ApiResponse<String>> register(@RequestBody RegisterRequest request) {

        // 注册逻辑
        return ResponseEntity.ok(ApiResponse.success("注册成功"));
    }
}
```

### API 文档集成

项目使用 OpenAPI 3.0 规范自动生成API文档：

```yaml
springdoc:
  api-docs:
    enabled: true
    path: /api-docs
  swagger-ui:
    enabled: true
    path: /swagger-ui.html
    operationsSorter: method
    tryItOutEnabled: false
```

访问 `http://localhost:18000/swagger-ui.html` 查看交互式API文档。

---

## 🔧 服务层架构

### 服务层设计模式

#### TaskService - 任务业务逻辑
```java
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)  // 默认只读事务
public class TaskService {

    private final TaskRepository taskRepository;
    private final TagMapper tagMapper;

    /**
     * 创建任务 - 需要写事务
     */
    @Transactional
    public TaskResponse createTask(Long userId, TaskCreateRequest request) {
        log.info("创建任务，用户ID: {}, 任务标题: {}", userId, request.getTitle());

        Task task = new Task();
        task.setUserId(userId);
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setStatus(Task.TaskStatus.PENDING);
        task.setCreatedAt(LocalDateTime.now());

        taskRepository.insert(task);
        log.info("任务创建成功，ID: {}", task.getId());

        return convertToResponse(task);
    }

    /**
     * 更新任务 - 需要写事务
     */
    @Transactional
    public TaskResponse updateTask(Long userId, Long taskId, TaskUpdateRequest request) {
        Task task = taskRepository.findByIdAndUserId(taskId, userId);
        if (task == null) {
            throw new RuntimeException("任务不存在或无权限访问");
        }

        // 更新字段
        if (request.getTitle() != null) {
            task.setTitle(request.getTitle());
        }
        if (request.getStatus() != null) {
            task.setStatus(request.getStatus());

            // 如果任务状态变为已完成，设置完成时间
            if (request.getStatus() == Task.TaskStatus.COMPLETED) {
                task.setCompletedAt(LocalDateTime.now());
                task.setCompletionRate(100.0);
            }
        }

        task.setUpdatedAt(LocalDateTime.now());
        taskRepository.updateById(task);

        return convertToResponse(task);
    }

    /**
     * 复杂查询 - 支持多条件动态查询
     */
    public IPage<TaskResponse> getTasks(Long userId, TaskQueryRequest request) {
        // 标签ID转换为标签名称
        List<String> tagNamesFromIds = null;
        if (request.getTagIds() != null && !request.getTagIds().isEmpty()) {
            tagNamesFromIds = convertTagIdsToNames(userId, request.getTagIds());
        }

        // 合并标签名称列表
        List<String> allTagNames = request.getTagNames();
        if (tagNamesFromIds != null) {
            if (allTagNames == null) {
                allTagNames = tagNamesFromIds;
            } else {
                allTagNames.addAll(tagNamesFromIds);
            }
        }

        Page<Task> page = new Page<>(request.getPageNum(), request.getPageSize());
        IPage<Task> taskPage = taskRepository.findByConditions(
            page, userId, request.getStatus(), request.getPriority(),
            request.getCategoryId(), request.getParentTaskId(),
            request.getKeyword(), request.getTodayOnly(),
            request.getOverdueOnly(), null, allTagNames,
            request.getSortBy(), request.getSortDirection()
        );

        return taskPage.convert(this::convertToResponse);
    }
}
```

**服务层特性：**
1. **事务管理**：使用Spring的声明式事务 `@Transactional`
2. **日志记录**：使用SLF4J记录关键操作
3. **异常处理**：统一的异常处理机制
4. **DTO转换**：实体对象与DTO之间的转换
5. **业务逻辑封装**：复杂的业务规则在Service层实现

---

## 💾 数据访问层

### MyBatis Plus 集成

#### Repository 接口设计
```java
@Mapper
public interface TaskRepository extends BaseMapper<Task> {

    /**
     * 简单查询 - 使用注解SQL
     */
    @Select("SELECT * FROM t_task WHERE user_id = #{userId} AND deleted = 0 ORDER BY created_at DESC")
    IPage<Task> findByUserIdWithPage(Page<Task> page, @Param("userId") Long userId);

    /**
     * 复杂动态查询 - 使用XML动态SQL
     */
    @Select({
        "<script>",
        "SELECT * FROM t_task WHERE user_id = #{userId} AND deleted = 0",
        "<if test='status != null'>AND status = #{status}</if>",
        "<if test='priority != null'>AND priority = #{priority}</if>",
        "<if test='keyword != null and keyword != \"\"'>",
        "AND (title LIKE CONCAT('%', #{keyword}, '%') OR description LIKE CONCAT('%', #{keyword}, '%'))",
        "</if>",
        "<if test='tagNames != null and tagNames.size() > 0'>",
        "AND (",
        "<foreach collection='tagNames' item='tagName' separator=' OR '>",
        "tags LIKE CONCAT('%', #{tagName}, '%')",
        "</foreach>",
        ")",
        "</if>",
        "ORDER BY sort_order ASC, created_at DESC",
        "</script>"
    })
    IPage<Task> findByConditions(Page<Task> page,
                               @Param("userId") Long userId,
                               @Param("status") Task.TaskStatus status,
                               @Param("priority") Task.Priority priority,
                               @Param("keyword") String keyword,
                               @Param("tagNames") List<String> tagNames);

    /**
     * 批量更新
     */
    @Update("UPDATE t_task SET status = #{status}, updated_at = NOW() WHERE user_id = #{userId} AND id IN (#{taskIds})")
    int batchUpdateStatus(@Param("userId") Long userId,
                         @Param("taskIds") List<Long> taskIds,
                         @Param("status") Task.TaskStatus status);
}
```

### MyBatis Plus 配置

```yaml
mybatis-plus:
  configuration:
    map-underscore-to-camel-case: true  # 下划线转驼峰
    cache-enabled: false                # 关闭二级缓存
    log-impl: org.apache.ibatis.logging.slf4j.Slf4jImpl  # 日志实现
  global-config:
    db-config:
      id-type: auto                    # 主键自增
      logic-delete-field: deleted       # 逻辑删除字段
      logic-delete-value: 1           # 逻辑删除值
      logic-not-delete-value: 0       # 逻辑未删除值
  type-handlers-package: com.tomato.todo.backend.handler  # 类型处理器包
```

### 自定义类型处理器

#### TaskPriorityTypeHandler
```java
@MappedTypes(Task.Priority.class)
public class TaskPriorityTypeHandler extends BaseTypeHandler<Task.Priority> {

    @Override
    public void setNonNullParameter(PreparedStatement ps, int i,
                                  Task.Priority parameter, JdbcType jdbcType) throws SQLException {
        ps.setString(i, parameter.getValue());
    }

    @Override
    public Task.Priority getNullableResult(ResultSet rs, String columnName) throws SQLException {
        String value = rs.getString(columnName);
        return Task.Priority.fromValue(value);
    }
}
```

---

## 🔒 安全配置与认证

### Spring Security 配置

#### SecurityConfig.java
```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // 启用CORS支持
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            // 禁用CSRF保护（API项目通常不需要）
            .csrf(csrf -> csrf.disable())
            // 配置授权规则
            .authorizeHttpRequests(authz -> authz
                // 允许所有OPTIONS请求（CORS预检）
                .requestMatchers("OPTIONS", "/**").permitAll()
                // 允许所有API请求访问（开发环境）
                .requestMatchers("/api/**").permitAll()
                // 允许健康检查端点
                .requestMatchers("/actuator/health").permitAll()
                // 允许API文档
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                // 其他所有请求需要认证
                .anyRequest().authenticated()
            )
            // 配置会话管理
            .sessionManagement(session -> session.maximumSessions(10));

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // 设置允许的源
        configuration.setAllowedOrigins(Arrays.asList(
            "http://localhost:3003",
            "http://127.0.0.1:3003",
            "http://localhost:5173"
        ));

        // 设置允许的方法
        configuration.setAllowedMethods(Arrays.asList(
            "GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"
        ));

        // 设置允许的头部
        configuration.setAllowedHeaders(Arrays.asList("*"));

        // 允许凭证
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}
```

### 认证机制设计

#### JWT Token 配置
```yaml
jwt:
  secret: tomato-todo-secret-key-2024
  expiration: 86400000  # 24小时
  refresh-expiration: 604800000  # 7天
```

#### 用户上下文管理
```java
public class UserContext {
    private static final ThreadLocal<Long> userId = new ThreadLocal<>();

    public static void setUserId(Long id) {
        userId.set(id);
    }

    public static Long getUserId() {
        return userId.get();
    }

    public static void clear() {
        userId.remove();
    }
}
```

### 安全最佳实践

1. **CORS配置**：限制允许的源、方法和头部
2. **Token管理**：JWT token过期机制和刷新token
3. **密码安全**：使用BCrypt加密存储密码
4. **API权限**：基于用户ID的数据隔离
5. **日志审计**：记录关键操作和安全事件

---

## ⚙️ 配置管理

### 多环境配置

#### application.yml 主配置
```yaml
spring:
  application:
    name: tomato-todo-backend
  profiles:
    active: dev

  # 数据源配置
  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://localhost:3306/tomato_todo?useSSL=false&serverTimezone=Asia/Shanghai
    username: root
    password: root
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      idle-timeout: 300000

  # Jackson配置
  jackson:
    time-zone: Asia/Shanghai
    date-format: yyyy-MM-dd HH:mm:ss
    serialization:
      write-dates-as-timestamps: false
```

#### 开发环境配置
```yaml
---
spring:
  config:
    activate:
      on-profile: dev
  datasource:
    url: jdbc:mysql://localhost:3306/tomato_todo_dev?useSSL=false&serverTimezone=Asia/Shanghai
    username: root
    password: root

logging:
  level:
    com.tomato.todo: DEBUG
    org.springframework.web: DEBUG
```

#### 生产环境配置
```yaml
---
spring:
  config:
    activate:
      on-profile: prod
  datasource:
    url: jdbc:mysql://localhost:3306/tomato_todo_prod?useSSL=true&serverTimezone=Asia/Shanghai
    username: ${DB_USERNAME:tomato_todo}
    password: ${DB_PASSWORD:password}

logging:
  level:
    root: WARN
    com.tomato.todo: INFO
  file:
    name: /var/log/tomato-todo/app.log
```

### 应用自定义配置

```yaml
app:
  # 文件上传配置
  upload:
    path: ./uploads
    max-size: 10MB

  # 定时任务配置
  schedule:
    enabled: true
    backup:
      enabled: true
      cron: "0 0 2 * * ?"  # 每天凌晨2点执行备份

  # 系统通知配置
  notification:
    enabled: true
    task-reminder:
      enabled: true
      advance-minutes: 5
```

---

## 🚀 开发与部署

### 开发环境启动

#### Maven 命令启动
```bash
# 编译并运行应用
mvn clean compile exec:java -Dexec.mainClass="com.tomato.todo.backend.TodoApplication"

# 指定端口运行
mvn clean compile exec:java -Dexec.mainClass="com.tomato.todo.backend.TodoApplication" -Dexec.args="--server.port=18000"

# 跳过测试编译运行
mvn clean compile exec:java -Dexec.mainClass="com.tomato.todo.backend.TodoApplication" -Dexec.args="--server.port=18000" -Dmaven.test.skip=true
```

#### IDE 配置
- **VM Options**: `-Dserver.port=18000`
- **Program Arguments**: `--spring.profiles.active=dev`
- **Environment Variables**: 可配置数据库连接等

### 生产环境部署

#### Docker 部署（推荐）
```dockerfile
FROM openjdk:17-jre-slim

WORKDIR /app
COPY target/tomato-todo-backend-1.0.0.jar app.jar

EXPOSE 8080

ENV JAVA_OPTS="-Xmx512m -Xms256m"
ENV SPRING_PROFILES_ACTIVE=prod

ENTRYPOINT ["java", "-jar", "app.jar"]
```

#### 传统部署
```bash
# 打包
mvn clean package -DskipTests

# 运行
java -jar -Dspring.profiles.active=prod target/tomato-todo-backend-1.0.0.jar
```

### 监控与管理

#### Spring Boot Actuator 端点
```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus
      base-path: /actuator
  endpoint:
    health:
      show-details: always
```

**主要端点：**
- `/actuator/health` - 应用健康检查
- `/actuator/metrics` - 应用指标
- `/actuator/prometheus` - Prometheus指标

---

## 📈 最佳实践

### 1. 代码规范

#### 命名规范
```java
// 实体类：使用业务名称
public class Task { }

// 控制器：使用业务名称 + Controller
public class TaskController { }

// 服务类：使用业务名称 + Service
public class TaskService { }

// 仓库类：使用业务名称 + Repository
public interface TaskRepository { }
```

#### 注解使用规范
```java
@Service
@RequiredArgsConstructor  // Lombok生成构造函数
@Transactional(readOnly = true)  // 默认只读事务
@Slf4j  // Lombok生成日志
public class TaskService {

    @Transactional  // 写操作需要单独声明
    public TaskResponse createTask(Long userId, TaskCreateRequest request) {
        log.info("创建任务，用户ID: {}, 标题: {}", userId, request.getTitle());
        // 业务逻辑
    }
}
```

### 2. 异常处理

#### 全局异常处理器
```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiResponse<Void>> handleBusinessException(BusinessException e) {
        log.warn("业务异常: {}", e.getMessage());
        return ResponseEntity.badRequest()
            .body(ApiResponse.error(400, e.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleException(Exception e) {
        log.error("系统异常", e);
        return ResponseEntity.internalServerError()
            .body(ApiResponse.error(500, "系统内部错误"));
    }
}
```

### 3. 日志管理

#### 日志级别配置
```yaml
logging:
  level:
    com.tomato.todo: DEBUG      # 应用日志
    org.springframework.web: INFO  # Spring日志
    com.baomidou.mybatisplus: DEBUG  # MyBatis Plus日志
    org.springframework.security: INFO  # Security日志
```

#### 日志记录规范
```java
// 信息日志 - 记录关键业务操作
log.info("用户 {} 创建任务: {}", userId, taskTitle);

// 警告日志 - 记录业务异常
log.warn("任务 {} 状态更新失败，当前状态: {}", taskId, currentStatus);

// 错误日志 - 记录系统异常
log.error("数据库操作失败", exception);

// 调试日志 - 记录详细信息
log.debug("查询参数: {}", queryParams);
```

### 4. 性能优化

#### 数据库优化
```java
// 批量操作
@Update("<script>UPDATE t_task SET status = #{status} WHERE user_id = #{userId} AND id IN " +
        "<foreach collection='taskIds' item='id' open='(' separator=',' close=')'>#{id}</foreach>" +
        "</script>")
int batchUpdateStatus(@Param("userId") Long userId,
                     @Param("taskIds") List<Long> taskIds,
                     @Param("status") TaskStatus status);

// 分页查询避免全表扫描
@Select("SELECT * FROM t_task WHERE user_id = #{userId} AND deleted = 0 ORDER BY created_at DESC LIMIT #{offset}, #{limit}")
List<Task> findTasksWithLimit(@Param("userId") Long userId,
                            @Param("offset") int offset,
                            @Param("limit") int limit);
```

#### 缓存策略
```java
@Service
@RequiredArgsConstructor
public class TaskService {

    // 使用Spring Cache
    @Cacheable(value = "tasks", key = "#userId + '_' + #taskId")
    public TaskResponse getTask(Long userId, Long taskId) {
        // 从数据库查询
    }

    @CacheEvict(value = "tasks", key = "#userId + '_' + #taskId")
    @Transactional
    public void updateTask(Long userId, Long taskId, TaskUpdateRequest request) {
        // 更新数据库并清除缓存
    }
}
```

### 5. 测试策略

#### 单元测试
```java
@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    @Mock
    private TaskRepository taskRepository;

    @InjectMocks
    private TaskService taskService;

    @Test
    void shouldCreateTaskSuccessfully() {
        // Given
        TaskCreateRequest request = new TaskCreateRequest();
        request.setTitle("Test Task");

        // When
        TaskResponse response = taskService.createTask(1L, request);

        // Then
        assertThat(response.getTitle()).isEqualTo("Test Task");
        verify(taskRepository).insert(any(Task.class));
    }
}
```

#### 集成测试
```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class TaskControllerIntegrationTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    void shouldCreateTaskSuccessfully() {
        TaskCreateRequest request = new TaskCreateRequest();
        request.setTitle("Test Task");

        ResponseEntity<ApiResponse> response = restTemplate.postForEntity(
            "/tasks", request, ApiResponse.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }
}
```

---

## ❓ 常见问题与解决方案

### 1. Spring Boot 相关问题

#### Q: 应用启动失败，提示数据库连接错误？
**A:** 检查以下几点：
- 确认MySQL服务已启动
- 检查数据库连接配置（URL、用户名、密码）
- 确认数据库已创建
- 检查网络连接和防火墙设置

#### Q: CORS跨域问题？
**A:** 解决方案：
- 检查 `SecurityConfig` 中的CORS配置
- 确认前端请求地址在允许的源列表中
- 检查请求头是否包含必要的CORS头部

#### Q: MyBatis Plus 查询返回null？
**A:** 常见原因：
- 数据库表名与实体类映射不正确
- 字段名映射问题（下划线vs驼峰）
- 逻辑删除字段配置问题
- 数据库中确实没有对应数据

### 2. 数据库相关问题

#### Q: 枚举类型存储问题？
**A:** 解决方案：
- 确保自定义TypeHandler正确配置
- 检查数据库字段类型（推荐VARCHAR）
- 验证枚举值的序列化/反序列化逻辑

#### Q: 分页查询不生效？
**A:** 检查：
- MyBatis Plus分页插件是否正确配置
- 查询方法是否传入了Page对象
- SQL查询是否包含LIMIT子句

### 3. 性能优化问题

#### Q: 查询性能慢？
**A:** 优化建议：
- 添加适当的数据库索引
- 使用分页查询避免大量数据传输
- 优化SQL查询，避免N+1问题
- 考虑使用缓存

#### Q: 内存使用过高？
**A:** 解决方案：
- 检查数据库连接池配置
- 优化大对象的处理
- 使用内存分析工具检查内存泄漏
- 调整JVM堆内存大小

### 4. 部署相关问题

#### Q: 生产环境配置不生效？
**A:** 检查：
- Spring Profile是否正确设置
- 配置文件路径是否正确
- 环境变量是否正确配置
- 配置文件语法是否正确

#### Q: 应用无法访问外部资源？
**A:** 解决方案：
- 检查防火墙设置
- 确认网络连接
- 检查SSL证书配置
- 验证代理设置

---

## 📚 学习资源

### Spring Boot 相关
- [Spring Boot 官方文档](https://docs.spring.io/spring-boot/docs/current/reference/html/)
- [Spring Security 参考指南](https://docs.spring.io/spring-security/reference/)
- [MyBatis Plus 官方文档](https://mybatis.plus/)

### 数据库相关
- [MySQL 8.0 官方文档](https://dev.mysql.com/doc/refman/8.0/en/)
- [HikariCP 连接池指南](https://github.com/brettwooldridge/HikariCP)

### 开发工具
- [Maven 官方文档](https://maven.apache.org/guides/)
- [Swagger/OpenAPI 规范](https://swagger.io/specification/)
- [Spring Boot Actuator 指南](https://docs.spring.io/spring-boot/docs/current/reference/html/actuator.html)

---

## 🎉 总结

本项目展示了一个完整的现代化Spring Boot后端应用的架构设计和实现：

### ✅ 技术亮点
- **现代化技术栈** - Spring Boot 3.x + Java 17
- **分层架构设计** - Controller、Service、Repository分层清晰
- **RESTful API** - 标准化的API设计
- **安全机制** - Spring Security + JWT认证
- **数据库集成** - MyBatis Plus + MySQL
- **文档支持** - Swagger/OpenAPI自动文档

### 🚀 开发优势
- **快速开发** - Spring Boot自动配置
- **代码质量** - 统一的代码规范和异常处理
- **可维护性** - 清晰的分层架构和模块化设计
- **可扩展性** - 基于Spring的生态体系
- **监控支持** - Actuator应用监控

### 📈 扩展方向
- **微服务架构** - 拆分为多个微服务
- **容器化部署** - Docker + Kubernetes
- **缓存优化** - Redis集群缓存
- **消息队列** - 异步任务处理
- **API网关** - 统一的API入口管理

这个后端架构为类似的Java Web应用开发提供了一个可靠的参考实现，开发者可以根据具体需求进行调整和扩展。