package com.tomato.todo.backend.controller;

import com.tomato.todo.backend.common.ApiResponse;
import com.tomato.todo.backend.dto.auth.AuthResponse;
import com.tomato.todo.backend.dto.auth.LoginRequest;
import com.tomato.todo.backend.dto.auth.RegisterRequest;
import com.tomato.todo.backend.service.UserService;
import com.tomato.todo.backend.util.JwtUtil;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

/**
 * 认证控制器
 *
 * @author Tomato Todo Team
 * @version 1.0.0
 */
@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "用户认证", description = "用户登录、注册、Token刷新等认证相关接口")
@CrossOrigin(origins = {
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000"
}, allowedHeaders = "*", methods = {
    RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT,
    RequestMethod.DELETE, RequestMethod.PATCH, RequestMethod.OPTIONS, RequestMethod.HEAD
}, allowCredentials = "true", maxAge = 3600)
public class AuthController {

    private final UserService userService;

    /**
     * 用户注册
     */
    @PostMapping("/register")
    @Operation(summary = "用户注册", description = "创建新用户账户")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        log.info("用户注册请求，用户名: {}", request.getUsername());

        try {
            AuthResponse response = userService.register(request);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (RuntimeException e) {
            log.error("用户注册失败: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(400, e.getMessage()));
        }
    }

    /**
     * 用户登录
     */
    @PostMapping("/login")
    @Operation(summary = "用户登录", description = "用户身份验证")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        log.info("用户登录请求，用户名: {}", request.getUsername());

        try {
            AuthResponse response = userService.login(request);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (RuntimeException e) {
            log.error("用户登录失败: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(400, e.getMessage()));
        }
    }

    /**
     * 刷新Token
     */
    @PostMapping("/refresh")
    @Operation(summary = "刷新Token", description = "使用刷新令牌获取新的访问令牌")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(
            @Parameter(description = "刷新令牌", required = true)
            @RequestParam String refreshToken) {
        log.info("Token刷新请求");

        try {
            AuthResponse response = userService.refreshToken(refreshToken);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (RuntimeException e) {
            log.error("Token刷新失败: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(400, e.getMessage()));
        }
    }

    /**
     * 用户登出
     */
    @PostMapping("/logout")
    @Operation(summary = "用户登出", description = "用户登出（客户端清除Token）")
    public ResponseEntity<ApiResponse<Void>> logout(HttpServletRequest request) {
        log.info("用户登出请求");

        // 从请求头中获取Token
        String token = getTokenFromRequest(request);
        if (token != null) {
            Long userId = JwtUtil.getUserIdFromToken(token);
            if (userId != null) {
                log.info("用户登出成功，用户ID: {}", userId);
            }
        }

        return ResponseEntity.ok(ApiResponse.success(null));
    }

    /**
     * 验证Token
     */
    @PostMapping("/validate")
    @Operation(summary = "验证Token", description = "验证访问令牌的有效性")
    public ResponseEntity<ApiResponse<Boolean>> validateToken(HttpServletRequest request) {
        String token = getTokenFromRequest(request);

        if (token == null) {
            return ResponseEntity.ok(ApiResponse.success(false));
        }

        boolean isValid = JwtUtil.validateToken(token);
        return ResponseEntity.ok(ApiResponse.success(isValid));
    }

    /**
     * 获取当前用户信息
     */
    @GetMapping("/me")
    @Operation(summary = "获取当前用户信息", description = "根据Token获取当前登录用户的信息")
    public ResponseEntity<ApiResponse<AuthResponse>> getCurrentUser(HttpServletRequest request) {
        String token = getTokenFromRequest(request);

        if (token == null || !JwtUtil.validateToken(token)) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.error(401, "Token无效或已过期"));
        }

        try {
            Long userId = JwtUtil.getUserIdFromToken(token);
            var user = userService.getUserById(userId);

            AuthResponse response = new AuthResponse();
            response.setUserId(user.getId());
            response.setUsername(user.getUsername());
            response.setNickname(user.getNickname());
            response.setEmail(user.getEmail());
            response.setAvatarUrl(user.getAvatarUrl());
            response.setTimezone(user.getTimezone());
            response.setLanguage(user.getLanguage());
            response.setTheme(user.getTheme());
            response.setLastLoginAt(user.getLastLoginAt());

            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (RuntimeException e) {
            log.error("获取用户信息失败: {}", e.getMessage());
            return ResponseEntity.status(401)
                    .body(ApiResponse.error(401, e.getMessage()));
        }
    }

    /**
     * 从请求中获取Token
     */
    private String getTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }

        // 也可以从Cookie中获取Token（如果需要）
        // String token = getCookieValue(request, "token");

        return null;
    }
}