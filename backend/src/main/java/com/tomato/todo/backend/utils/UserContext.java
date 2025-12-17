package com.tomato.todo.backend.utils;

import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;

/**
 * 用户上下文工具类
 */
public class UserContext {

    private static final String USER_ID_HEADER = "X-User-Id";
    private static final String USER_ID_ATTRIBUTE = "userId";

    /**
     * 获取当前用户ID
     */
    public static Long getCurrentUserId() {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes == null) {
            throw new IllegalStateException("无法获取当前请求上下文");
        }

        // 首先从请求属性中获取（由拦截器设置）
        Long userId = (Long) attributes.getAttribute(USER_ID_ATTRIBUTE, ServletRequestAttributes.SCOPE_REQUEST);
        if (userId != null) {
            return userId;
        }

        // 如果没有，从请求头中获取
        HttpServletRequest request = attributes.getRequest();
        String userIdHeader = request.getHeader(USER_ID_HEADER);
        if (userIdHeader != null && !userIdHeader.isEmpty()) {
            try {
                return Long.parseLong(userIdHeader);
            } catch (NumberFormatException e) {
                throw new IllegalStateException("无效的用户ID格式");
            }
        }

        throw new IllegalStateException("用户未登录或用户ID缺失");
    }

    /**
     * 设置当前用户ID（通常由拦截器调用）
     */
    public static void setCurrentUserId(Long userId) {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes != null) {
            attributes.setAttribute(USER_ID_ATTRIBUTE, userId, ServletRequestAttributes.SCOPE_REQUEST);
        }
    }
}