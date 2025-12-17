package com.tomato.todo.backend.controller;

import com.tomato.todo.backend.dto.auth.AuthResponse;
import com.tomato.todo.backend.dto.auth.LoginRequest;
import com.tomato.todo.backend.dto.auth.RegisterRequest;
import com.tomato.todo.backend.common.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import lombok.extern.slf4j.Slf4j;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 认证控制器 - 用于处理登录和注册
 *
 * @author Tomato Todo Team
 * @version 1.0.0
 */
@Slf4j
@RestController
@RequestMapping("/auth")
@Tag(name = "用户认证", description = "用户登录、注册等认证相关接口")
public class AuthenticationController {

    /**
     * 用户登录
     */
    @PostMapping("/login")
    @Operation(summary = "用户登录", description = "用户身份验证")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@RequestBody LoginRequest request) {
        log.info("用户登录请求被访问: {}", request);

        // 创建模拟的登录响应（实际应用中需要验证用户名和密码）
        AuthResponse authResponse = new AuthResponse();
        authResponse.setAccessToken(UUID.randomUUID().toString().replace("-", ""));
        authResponse.setRefreshToken(UUID.randomUUID().toString().replace("-", ""));
        authResponse.setUserId(2L);
        authResponse.setUsername(request.getUsername());
        authResponse.setNickname(request.getUsername() + "用户");
        authResponse.setEmail(request.getUsername() + "@example.com");
        authResponse.setAvatarUrl("https://example.com/avatar.jpg");
        authResponse.setLastLoginAt(LocalDateTime.now());
        authResponse.setExpiresAt(LocalDateTime.now().plusDays(1));

        return ResponseEntity.ok(ApiResponse.success(authResponse));
    }

    /**
     * 用户注册
     */
    @PostMapping("/register")
    @Operation(summary = "用户注册", description = "创建新用户账户")
    public ResponseEntity<ApiResponse<String>> register(@RequestBody RegisterRequest request) {
        log.info("用户注册请求被访问: {}", request);

        // 模拟注册成功响应
        return ResponseEntity.ok(ApiResponse.success("注册成功"));
    }

    /**
     * 测试端点
     */
    @GetMapping("/test")
    @Operation(summary = "测试端点", description = "测试AuthController是否工作")
    public ResponseEntity<String> test() {
        log.info("AuthController测试端点被访问");
        return ResponseEntity.ok("AuthController is working!");
    }
}