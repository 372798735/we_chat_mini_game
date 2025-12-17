package com.tomato.todo.backend.dto.task;

import com.tomato.todo.backend.entity.Task;
import lombok.Data;

import java.util.List;

/**
 * 任务查询请求DTO
 *
 * @author Tomato Todo Team
 * @version 1.0.0
 */
@Data
public class TaskQueryRequest {

    /**
     * 页码（从1开始）
     */
    private Integer pageNum = 1;

    /**
     * 每页大小
     */
    private Integer pageSize = 20;

    /**
     * 任务状态
     */
    private Task.TaskStatus status;

    /**
     * 优先级
     */
    private Task.Priority priority;

    /**
     * 分类ID
     */
    private Long categoryId;

    /**
     * 父任务ID（查询子任务）
     */
    private Long parentTaskId;

    /**
     * 搜索关键词
     */
    private String keyword;

    /**
     * 标签ID列表
     */
    private List<Long> tagIds;

    /**
     * 标签名称列表（支持字符串搜索）
     */
    private List<String> tagNames;

    /**
     * 设置标签ID列表（处理前端传来的tags参数）
     */
    public void setTags(List<Long> tags) {
        this.tagIds = tags;
    }

    /**
     * 获取标签ID列表（处理前端传来的tags参数）
     */
    public List<Long> getTags() {
        return this.tagIds;
    }

    /**
     * 设置标签名称列表
     */
    public void setTagNames(List<String> tagNames) {
        this.tagNames = tagNames;
    }

    /**
     * 获取标签名称列表
     */
    public List<String> getTagNames() {
        return this.tagNames;
    }

    /**
     * 是否只查询今日任务
     */
    private Boolean todayOnly = false;

    /**
     * 是否只查询逾期任务
     */
    private Boolean overdueOnly = false;

    /**
     * 排序字段
     */
    private String sortBy = "createdAt";

    /**
     * 排序方向（asc/desc）
     */
    private String sortDirection = "desc";
}