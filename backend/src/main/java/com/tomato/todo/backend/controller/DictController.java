package com.tomato.todo.backend.controller;

import com.tomato.todo.backend.dto.dict.TagCreateRequest;
import com.tomato.todo.backend.dto.dict.TagResponse;
import com.tomato.todo.backend.service.TagService;
import com.tomato.todo.backend.utils.UserContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 字典管理控制器
 */
@Slf4j
@RestController
@RequestMapping("/dict")
@RequiredArgsConstructor
public class DictController {

    private final TagService tagService;

    /**
     * 获取所有标签
     */
    @GetMapping("/tags")
    public ResponseEntity<List<TagResponse>> getAllTags() {
        Long userId = UserContext.getCurrentUserId();
        List<TagResponse> tags = tagService.getAllTags(userId);
        return ResponseEntity.ok(tags);
    }

    /**
     * 创建标签
     */
    @PostMapping("/tags")
    public ResponseEntity<TagResponse> createTag(@Validated @RequestBody TagCreateRequest request) {
        Long userId = UserContext.getCurrentUserId();
        TagResponse tag = tagService.createTag(request, userId);
        return ResponseEntity.ok(tag);
    }

    /**
     * 更新标签
     */
    @PutMapping("/tags/{id}")
    public ResponseEntity<TagResponse> updateTag(
            @PathVariable Long id,
            @Validated @RequestBody TagCreateRequest request) {
        Long userId = UserContext.getCurrentUserId();
        TagResponse tag = tagService.updateTag(id, request, userId);
        return ResponseEntity.ok(tag);
    }

    /**
     * 删除标签
     */
    @DeleteMapping("/tags/{id}")
    public ResponseEntity<Void> deleteTag(@PathVariable Long id) {
        Long userId = UserContext.getCurrentUserId();
        tagService.deleteTag(id, userId);
        return ResponseEntity.ok().build();
    }
}