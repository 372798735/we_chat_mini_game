package com.tomato.todo.backend.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.tomato.todo.backend.dto.auth.AuthResponse;
import com.tomato.todo.backend.dto.auth.LoginRequest;
import com.tomato.todo.backend.dto.auth.RegisterRequest;
import com.tomato.todo.backend.entity.User;
import com.tomato.todo.backend.repository.UserRepository;
import com.tomato.todo.backend.util.JwtUtil;
import com.tomato.todo.backend.util.PasswordUtil;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * 用户服务类
 *
 * @author Tomato Todo Team
 * @version 1.0.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    /**
     * 用户注册
     *
     * @param request 注册请求
     * @return 认证响应
     */
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        log.info("用户注册请求，用户名: {}, 邮箱: {}", request.getUsername(), request.getEmail());

        // 检查用户名是否已存在
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("用户名已存在");
        }

        // 检查邮箱是否已存在
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("邮箱已被注册");
        }

        // 创建新用户
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPasswordHash(PasswordUtil.encode(request.getPassword()));
        user.setNickname(request.getNickname() != null ? request.getNickname() : request.getUsername());
        user.setTimezone("Asia/Shanghai");
        user.setLanguage("zh-CN");
        user.setTheme("light");
        user.setIsActive(true);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        user.setLastLoginAt(LocalDateTime.now());

        // 保存用户
        userRepository.insert(user);

        log.info("用户注册成功，用户ID: {}", user.getId());

        // 生成Token
        return buildAuthResponse(user);
    }

    /**
     * 用户登录
     *
     * @param request 登录请求
     * @return 认证响应
     */
    public AuthResponse login(LoginRequest request) {
        log.info("用户登录请求，用户名: {}", request.getUsername());

        // 查找用户
        User user = userRepository.findByUsername(request.getUsername());
        if (user == null) {
            throw new RuntimeException("用户名或密码错误");
        }

        // 检查用户是否激活
        if (!user.getIsActive()) {
            throw new RuntimeException("账户已被禁用");
        }

        // 验证密码
        if (!PasswordUtil.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("用户名或密码错误");
        }

        // 更新最后登录时间
        userRepository.updateLastLoginAt(user.getId(), LocalDateTime.now());
        user.setLastLoginAt(LocalDateTime.now());

        log.info("用户登录成功，用户ID: {}", user.getId());

        // 生成Token
        return buildAuthResponse(user);
    }

    /**
     * 刷新Token
     *
     * @param refreshToken 刷新令牌
     * @return 认证响应
     */
    public AuthResponse refreshToken(String refreshToken) {
        log.info("刷新Token请求");

        // 验证刷新Token
        if (!JwtUtil.validateRefreshToken(refreshToken)) {
            throw new RuntimeException("刷新Token无效或已过期");
        }

        // 从Token中获取用户ID
        Long userId = JwtUtil.getUserIdFromToken(refreshToken);
        if (userId == null) {
            throw new RuntimeException("无法从Token中获取用户信息");
        }

        // 查找用户
        User user = userRepository.selectById(userId);
        if (user == null || !user.getIsActive()) {
            throw new RuntimeException("用户不存在或已被禁用");
        }

        log.info("Token刷新成功，用户ID: {}", userId);

        // 生成新的Token
        return buildAuthResponse(user);
    }

    /**
     * 根据用户ID获取用户信息
     *
     * @param userId 用户ID
     * @return 用户信息
     */
    public User getUserById(Long userId) {
        User user = userRepository.selectById(userId);
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }
        return user;
    }

    /**
     * 更新用户信息
     *
     * @param userId 用户ID
     * @param user 用户信息
     * @return 更新后的用户信息
     */
    @Transactional
    public User updateUser(Long userId, User user) {
        User existingUser = getUserById(userId);

        // 更新允许修改的字段
        if (user.getNickname() != null) {
            existingUser.setNickname(user.getNickname());
        }
        if (user.getEmail() != null && !user.getEmail().equals(existingUser.getEmail())) {
            // 检查新邮箱是否已被使用
            if (userRepository.existsByEmail(user.getEmail())) {
                throw new RuntimeException("邮箱已被其他用户使用");
            }
            existingUser.setEmail(user.getEmail());
        }
        if (user.getAvatarUrl() != null) {
            existingUser.setAvatarUrl(user.getAvatarUrl());
        }
        if (user.getTimezone() != null) {
            existingUser.setTimezone(user.getTimezone());
        }
        if (user.getLanguage() != null) {
            existingUser.setLanguage(user.getLanguage());
        }
        if (user.getTheme() != null) {
            existingUser.setTheme(user.getTheme());
        }

        existingUser.setUpdatedAt(LocalDateTime.now());
        userRepository.updateById(existingUser);

        log.info("用户信息更新成功，用户ID: {}", userId);
        return existingUser;
    }

    /**
     * 修改密码
     *
     * @param userId 用户ID
     * @param oldPassword 旧密码
     * @param newPassword 新密码
     */
    @Transactional
    public void changePassword(Long userId, String oldPassword, String newPassword) {
        User user = getUserById(userId);

        // 验证旧密码
        if (!PasswordUtil.matches(oldPassword, user.getPasswordHash())) {
            throw new RuntimeException("旧密码错误");
        }

        // 更新密码
        user.setPasswordHash(PasswordUtil.encode(newPassword));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.updateById(user);

        log.info("用户密码修改成功，用户ID: {}", userId);
    }

    /**
     * 激活/禁用用户
     *
     * @param userId 用户ID
     * @param isActive 是否激活
     */
    @Transactional
    public void updateUserStatus(Long userId, Boolean isActive) {
        userRepository.updateUserStatus(userId, isActive);
        log.info("用户状态更新成功，用户ID: {}, 状态: {}", userId, isActive);
    }

    /**
     * 构建认证响应
     *
     * @param user 用户信息
     * @return 认证响应
     */
    private AuthResponse buildAuthResponse(User user) {
        AuthResponse response = new AuthResponse();
        response.setAccessToken(JwtUtil.generateToken(user.getId(), user.getUsername()));
        response.setRefreshToken(JwtUtil.generateRefreshToken(user.getId()));
        response.setUserId(user.getId());
        response.setUsername(user.getUsername());
        response.setNickname(user.getNickname());
        response.setEmail(user.getEmail());
        response.setAvatarUrl(user.getAvatarUrl());
        response.setTimezone(user.getTimezone());
        response.setLanguage(user.getLanguage());
        response.setTheme(user.getTheme());
        response.setLastLoginAt(user.getLastLoginAt());

        // 设置Token过期时间
        java.util.Date expirationDate = JwtUtil.getExpirationDateFromToken(response.getAccessToken());
        if (expirationDate != null) {
            LocalDateTime expiresAt = expirationDate.toInstant()
                    .atZone(java.time.ZoneId.systemDefault())
                    .toLocalDateTime();
            response.setExpiresAt(expiresAt);
        }

        return response;
    }
}