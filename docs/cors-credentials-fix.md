# CORS allowCredentials 配置错误修复

## 问题描述

后端启动时出现CORS配置错误：
```
When allowCredentials is true, allowedOrigins cannot contain the special value "*" since that cannot be set on the "Access-Control-Allow-Origin" response header.
```

## 错误原因

Spring Boot CORS配置规则：
- 当 `allowCredentials = true` 时，不能使用 `allowedOrigins("*")` 通配符
- 这是因为 `Access-Control-Allow-Origin: *` 与 `Access-Control-Allow-Credentials: true` 不兼容
- 需要明确指定允许的源地址

## 修复方案

### 1. 修复 CorsConfig.java

**问题代码：**
```java
registry.addMapping("/**")
        .allowedOriginPatterns("*")  // ❌ 与 allowCredentials=true 冲突
        .allowCredentials(true)
```

**修复后：**
```java
registry.addMapping("/**")
        .allowedOrigins(           // ✅ 明确指定源地址
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                "http://localhost:3000",
                "http://127.0.0.1:3000"
        )
        .allowCredentials(true)
```

### 2. 修复 CorsFilterConfig.java

**问题代码：**
```java
configuration.setAllowedOriginPatterns(Arrays.asList("*")); // ❌ 冲突
configuration.setAllowCredentials(true);
```

**修复后：**
```java
configuration.setAllowedOrigins(Arrays.asList(              // ✅ 明确指定
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
));
configuration.setAllowCredentials(true);
```

### 3. 修复所有Controller注解

**问题代码：**
```java
@CrossOrigin(origins = "*", allowCredentials = "true") // ❌ 冲突
```

**修复后：**
```java
@CrossOrigin(origins = {
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000"
}, allowCredentials = "true") // ✅ 明确指定
```

## 修复的文件

1. ✅ `backend/src/main/java/com/tomato/todo/backend/config/CorsConfig.java`
2. ✅ `backend/src/main/java/com/tomato/todo/backend/config/CorsFilterConfig.java`
3. ✅ `backend/src/main/java/com/tomato/todo/backend/controller/TaskController.java`
4. ✅ `backend/src/main/java/com/tomato/todo/backend/controller/PomodoroController.java`
5. ✅ `backend/src/main/java/com/tomato/todo/backend/controller/StatisticsController.java`
6. ✅ `backend/src/main/java/com/tomato/todo/backend/controller/TestController.java`

## 支持的源地址

当前配置支持以下前端地址：
- `http://localhost:5173` - Vite 开发服务器
- `http://127.0.0.1:5173` - Vite 本地地址
- `http://localhost:3000` - Create React App 开发服务器
- `http://127.0.0.1:3000` - Create React App 本地地址

## CORS配置特性

- ✅ **允许凭证**: `allowCredentials = true`
- ✅ **支持所有HTTP方法**: GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD
- ✅ **允许所有请求头**: `allowedHeaders = "*"`
- ✅ **暴露特定响应头**: Authorization, Content-Type, X-Total-Count, X-Request-ID
- ✅ **预检缓存**: `maxAge = 3600` (1小时)

## 验证修复

启动后端应用：
```bash
cd backend
mvn spring-boot:run
```

应用应该正常启动，不再出现CORS配置错误。

测试CORS端点：
```bash
curl -X GET http://localhost:8080/api/test/cors
```

## 注意事项

1. **生产环境**: 在生产环境中，应该将允许的源地址列表限制为实际的前端域名
2. **安全考虑**: `allowCredentials = true` 意味着浏览器会发送Cookie和认证信息
3. **添加新源**: 如需支持其他前端地址，请在所有配置文件中添加对应的URL

## 错误解决总结

这个错误的根本原因是Spring Boot对CORS安全性的强制要求：
- 当需要发送凭证（cookies、authorization headers等）时，必须明确指定允许的源
- 通配符 `*` 会绕过浏览器的安全检查，因此被禁止与 `allowCredentials=true` 同时使用

现在所有CORS配置都已修复，应用应该能够正常启动并处理跨域请求！