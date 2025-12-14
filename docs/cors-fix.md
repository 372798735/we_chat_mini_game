# CORS跨域问题修复说明

## 问题描述

前端应用在访问后端API时遇到CORS跨域错误：
```
Access to XMLHttpRequest at 'http://localhost:8080/api/tasks' from origin 'http://localhost:5173' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## 解决方案

### 1. 创建CORS配置类
创建了 `CorsConfig.java` 配置类，实现了全局CORS配置：

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:5173", "http://127.0.0.1:5173")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
```

### 2. 添加应用配置
在 `application.yml` 中添加了CORS配置：

```yaml
spring:
  web:
    cors:
      allowed-origins: "http://localhost:5173,http://127.0.0.1:5173"
      allowed-methods: "GET,POST,PUT,DELETE,PATCH,OPTIONS"
      allowed-headers: "*"
      allow-credentials: true
      max-age: 3600
```

### 3. Controller层CORS注解
为所有Controller添加了 `@CrossOrigin` 注解：

```java
@CrossOrigin(origins = {
    "http://localhost:5173",
    "http://127.0.0.1:5173"
}, methods = {
    RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT,
    RequestMethod.DELETE, RequestMethod.PATCH, RequestMethod.OPTIONS
}, allowCredentials = "true")
```

### 4. 全局CORS过滤器
创建了 `CorsFilter.java` 作为额外的保护措施，确保所有请求都能正确处理CORS。

## 修复文件列表

1. `backend/src/main/java/com/tomato/todo/backend/config/CorsConfig.java` - CORS配置类
2. `backend/src/main/java/com/tomato/todo/backend/config/CorsFilter.java` - CORS过滤器
3. `backend/src/main/resources/application.yml` - 更新了CORS配置
4. `backend/src/main/java/com/tomato/todo/backend/controller/TaskController.java` - 添加CORS注解
5. `backend/src/main/java/com/tomato/todo/backend/controller/PomodoroController.java` - 添加CORS注解
6. `backend/src/main/java/com/tomato/todo/backend/controller/StatisticsController.java` - 添加CORS注解

## 验证修复

修复后，前端应用应该能够正常访问后端API，不再出现CORS错误。

如果仍有问题，请检查：
1. 后端服务是否正常启动
2. 前端请求的URL是否正确
3. 浏览器缓存是否已清除
4. 网络代理设置是否影响

## 支持的前端地址

当前配置支持以下前端地址：
- http://localhost:5173 (Vite默认端口)
- http://127.0.0.1:5173
- http://localhost:3000 (Create React App默认端口)
- http://127.0.0.1:3000

如需添加其他前端地址，请更新上述配置文件中的 `allowedOrigins` 列表。