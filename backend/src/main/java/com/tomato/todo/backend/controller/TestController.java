package com.tomato.todo.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * 测试控制器 - 用于验证CORS配置
 */
@RestController
@RequestMapping("/api/test")
@CrossOrigin(origins = {
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000"
}, maxAge = 3600, allowCredentials = "true")
public class TestController {

    @GetMapping("/cors")
    public ResponseEntity<Map<String, Object>> testCors() {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "CORS配置测试成功！");
        response.put("timestamp", System.currentTimeMillis());
        response.put("success", true);

        return ResponseEntity.ok()
                .header("Access-Control-Allow-Origin", "*")
                .header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
                .header("Access-Control-Allow-Headers", "*")
                .body(response);
    }

    @PostMapping("/cors")
    public ResponseEntity<Map<String, Object>> testCorsPost(@RequestBody Map<String, Object> data) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "POST CORS测试成功！");
        response.put("receivedData", data);
        response.put("timestamp", System.currentTimeMillis());
        response.put("success", true);

        return ResponseEntity.ok(response);
    }

    @RequestMapping(value = "/cors", method = RequestMethod.OPTIONS)
    public ResponseEntity<Void> handleOptions() {
        return ResponseEntity.ok().build();
    }
}