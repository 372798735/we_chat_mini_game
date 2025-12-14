package com.tomato.todo.backend.interceptor;

import com.tomato.todo.backend.entity.User;
import com.tomato.todo.backend.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * 用户认证拦截器
 * 验证请求中的用户ID是否有效
 *
 * @author Tomato Todo Team
 * @version 1.0.0
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AuthInterceptor implements HandlerInterceptor {

    private final UserService userService;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String requestURI = request.getRequestURI();

        // 跳过不需要认证的路径
        if (isPublicPath(requestURI)) {
            return true;
        }

        // 获取用户ID
        String userIdHeader = request.getHeader("X-User-Id");
        if (userIdHeader == null || userIdHeader.trim().isEmpty()) {
            log.warn("请求缺少用户ID头部: {}", requestURI);
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"code\":401,\"message\":\"缺少用户认证信息\"}");
            return false;
        }

        try {
            Long userId = Long.parseLong(userIdHeader);

            // 验证用户是否存在且激活
            User user;
            try {
                user = userService.getUserById(userId);
            } catch (Exception e) {
                log.warn("用户不存在: userId={}, uri={}", userId, requestURI);
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("{\"code\":401,\"message\":\"用户认证失败\"}");
                return false;
            }

            if (user == null || !user.getIsActive()) {
                log.warn("用户未激活: userId={}, uri={}", userId, requestURI);
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("{\"code\":401,\"message\":\"用户认证失败\"}");
                return false;
            }

            // 将用户信息存入请求属性，方便后续使用
            request.setAttribute("currentUserId", userId);
            request.setAttribute("currentUser", user);

            log.debug("用户认证成功: userId={}, uri={}", userId, requestURI);
            return true;

        } catch (NumberFormatException e) {
            log.warn("无效的用户ID格式: {}, uri={}", userIdHeader, requestURI);
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"code\":401,\"message\":\"无效的用户ID格式\"}");
            return false;
        }
    }

    /**
     * 判断是否为公共路径（不需要认证）
     */
    private boolean isPublicPath(String requestURI) {
        // API路径前缀
        if (!requestURI.startsWith("/api/")) {
            return true;
        }

        // 认证相关路径
        if (requestURI.startsWith("/api/auth/")) {
            return true;
        }

        // 健康检查
        if (requestURI.equals("/actuator/health")) {
            return true;
        }

        // API文档
        if (requestURI.startsWith("/swagger-ui/") || requestURI.startsWith("/v3/api-docs/")) {
            return true;
        }

        return false;
    }
}