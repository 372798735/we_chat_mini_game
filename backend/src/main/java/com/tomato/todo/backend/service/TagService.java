package com.tomato.todo.backend.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.tomato.todo.backend.dto.dict.TagCreateRequest;
import com.tomato.todo.backend.dto.dict.TagResponse;
import com.tomato.todo.backend.entity.Tag;
import com.tomato.todo.backend.mapper.TagMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 标签服务类
 */
@Service
@RequiredArgsConstructor
public class TagService extends ServiceImpl<TagMapper, Tag> {

    /**
     * 获取所有标签
     */
    public List<TagResponse> getAllTags(Long userId) {
        LambdaQueryWrapper<Tag> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(Tag::getUserId, userId)
                   .orderByDesc(Tag::getCreatedAt);

        List<Tag> tags = list(queryWrapper);
        return tags.stream()
                   .map(this::convertToResponse)
                   .collect(Collectors.toList());
    }

    /**
     * 创建标签
     */
    public TagResponse createTag(TagCreateRequest request, Long userId) {
        // 检查标签名称是否已存在
        LambdaQueryWrapper<Tag> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(Tag::getName, request.getName())
                   .eq(Tag::getUserId, userId);

        if (count(queryWrapper) > 0) {
            throw new RuntimeException("标签名称已存在");
        }

        Tag tag = new Tag();
        BeanUtils.copyProperties(request, tag);
        tag.setUserId(userId);
        tag.setCreatedAt(LocalDateTime.now());
        tag.setUpdatedAt(LocalDateTime.now());

        // 设置默认颜色
        if (tag.getColor() == null || tag.getColor().isEmpty()) {
            tag.setColor("#1890ff");
        }

        save(tag);
        return convertToResponse(tag);
    }

    /**
     * 更新标签
     */
    public TagResponse updateTag(Long id, TagCreateRequest request, Long userId) {
        Tag tag = getById(id);
        if (tag == null || !tag.getUserId().equals(userId)) {
            throw new RuntimeException("标签不存在");
        }

        // 检查标签名称是否已存在（排除当前标签）
        LambdaQueryWrapper<Tag> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(Tag::getName, request.getName())
                   .eq(Tag::getUserId, userId)
                   .ne(Tag::getId, id);

        if (count(queryWrapper) > 0) {
            throw new RuntimeException("标签名称已存在");
        }

        BeanUtils.copyProperties(request, tag);
        tag.setUpdatedAt(LocalDateTime.now());

        updateById(tag);
        return convertToResponse(tag);
    }

    /**
     * 删除标签
     */
    public void deleteTag(Long id, Long userId) {
        Tag tag = getById(id);
        if (tag == null || !tag.getUserId().equals(userId)) {
            throw new RuntimeException("标签不存在");
        }

        removeById(id);
    }

    /**
     * 转换为响应DTO
     */
    private TagResponse convertToResponse(Tag tag) {
        TagResponse response = new TagResponse();
        BeanUtils.copyProperties(tag, response);
        return response;
    }
}