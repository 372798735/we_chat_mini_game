package com.tomato.todo.backend.exception;

import com.tomato.todo.backend.common.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * 全局异常处理器
 *
 * @author Tomato Todo Team
 * @version 1.0.0
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * 处理运行时异常
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ApiResponse<Object>> handleRuntimeException(RuntimeException e) {
        log.error("运行时异常: {}", e.getMessage(), e);

        String message = e.getMessage();
        if (message != null) {
            // 根据异常消息返回不同的状态码
            if (message.contains("已有进行中的番茄钟")) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error(400, "当前已有番茄钟在进行中，请先停止当前番茄钟"));
            }

            if (message.contains("不存在") || message.contains("无权限")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(404, message));
            }

            // 其他业务逻辑错误
            if (message.contains("请先") || message.contains("不能") || message.contains("无效") || message.contains("已完成")) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error(400, message));
            }
        }

        // 默认返回500错误
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(ApiResponse.error(500, "系统内部错误"));
    }

    /**
     * 处理其他异常
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handleException(Exception e) {
        log.error("系统异常: {}", e.getMessage(), e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(ApiResponse.error(500, "系统内部错误"));
    }
}