package com.tomato.todo.backend.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.tomato.todo.backend.entity.Task;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 任务数据访问层
 *
 * @author Tomato Todo Team
 * @version 1.0.0
 */
@Mapper
public interface TaskRepository extends BaseMapper<Task> {

    /**
     * 分页查询用户任务
     */
    @Select("SELECT * FROM t_task WHERE user_id = #{userId} AND deleted = 0 ORDER BY sort_order ASC, created_at DESC")
    IPage<Task> findByUserIdWithPage(Page<Task> page, @Param("userId") Long userId);

    /**
     * 根据状态查询用户任务
     */
    @Select("SELECT * FROM t_task WHERE user_id = #{userId} AND status = #{status} AND deleted = 0 ORDER BY created_at DESC")
    List<Task> findByUserIdAndStatus(@Param("userId") Long userId, @Param("status") Task.TaskStatus status);

    /**
     * 根据优先级查询用户任务
     */
    @Select("SELECT * FROM t_task WHERE user_id = #{userId} AND priority = #{priority} AND deleted = 0 ORDER BY created_at DESC")
    List<Task> findByUserIdAndPriority(@Param("userId") Long userId, @Param("priority") Task.Priority priority);

    /**
     * 根据分类查询用户任务
     */
    @Select("SELECT * FROM t_task WHERE user_id = #{userId} AND category_id = #{categoryId} AND deleted = 0 ORDER BY sort_order ASC, created_at DESC")
    List<Task> findByUserIdAndCategoryId(@Param("userId") Long userId, @Param("categoryId") Long categoryId);

    /**
     * 查询今日到期的任务
     */
    @Select("SELECT * FROM t_task WHERE user_id = #{userId} AND due_date BETWEEN #{startOfDay} AND #{endOfDay} AND deleted = 0 ORDER BY due_date ASC")
    List<Task> findTodayDueTasks(@Param("userId") Long userId, @Param("startOfDay") LocalDateTime startOfDay, @Param("endOfDay") LocalDateTime endOfDay);

    /**
     * 查询逾期任务
     */
    @Select("SELECT * FROM t_task WHERE user_id = #{userId} AND due_date < #{now} AND status NOT IN ('completed', 'cancelled') AND deleted = 0 ORDER BY due_date ASC")
    List<Task> findOverdueTasks(@Param("userId") Long userId, @Param("now") LocalDateTime now);

    /**
     * 查询即将到期的任务（指定分钟数内）
     */
    @Select("SELECT * FROM t_task WHERE user_id = #{userId} AND reminder_time BETWEEN #{now} AND #{reminderTime} AND status NOT IN ('completed', 'cancelled') AND deleted = 0 ORDER BY reminder_time ASC")
    List<Task> findUpcomingReminderTasks(@Param("userId") Long userId, @Param("now") LocalDateTime now, @Param("reminderTime") LocalDateTime reminderTime);

    /**
     * 搜索用户任务
     */
    @Select("SELECT * FROM t_task WHERE user_id = #{userId} AND (title LIKE CONCAT('%', #{keyword}, '%') OR description LIKE CONCAT('%', #{keyword}, '%')) AND deleted = 0 ORDER BY created_at DESC")
    List<Task> searchTasks(@Param("userId") Long userId, @Param("keyword") String keyword);

    /**
     * 查询子任务
     */
    @Select("SELECT * FROM t_task WHERE user_id = #{userId} AND parent_task_id = #{parentTaskId} AND deleted = 0 ORDER BY sort_order ASC, created_at ASC")
    List<Task> findSubTasks(@Param("userId") Long userId, @Param("parentTaskId") Long parentTaskId);

    /**
     * 统计用户任务数量
     */
    @Select("SELECT COUNT(*) FROM t_task WHERE user_id = #{userId} AND status = #{status} AND deleted = 0")
    long countByUserIdAndStatus(@Param("userId") Long userId, @Param("status") Task.TaskStatus status);

    /**
     * 批量更新任务状态
     */
    @Update("UPDATE t_task SET status = #{status}, updated_at = NOW() WHERE user_id = #{userId} AND id IN (#{taskIds})")
    int batchUpdateStatus(@Param("userId") Long userId, @Param("taskIds") List<Long> taskIds, @Param("status") Task.TaskStatus status);

    /**
     * 获取用户下一个任务（按排序和创建时间）
     */
    @Select("SELECT * FROM t_task WHERE user_id = #{userId} AND status = 'pending' AND deleted = 0 ORDER BY sort_order ASC, created_at ASC LIMIT 1")
    Task findNextPendingTask(@Param("userId") Long userId);

    /**
     * 根据ID获取用户任务（包含删除检查）
     */
    @Select("SELECT * FROM t_task WHERE id = #{taskId} AND user_id = #{userId} AND deleted = 0")
    Task findByIdAndUserId(@Param("taskId") Long taskId, @Param("userId") Long userId);

    /**
     * 根据多个条件动态查询用户任务
     */
    @Select({
        "<script>",
        "SELECT * FROM t_task WHERE user_id = #{userId} AND deleted = 0",
        "<if test='status != null'>AND status = #{status}</if>",
        "<if test='priority != null'>AND priority = #{priority}</if>",
        "<if test='categoryId != null'>AND category_id = #{categoryId}</if>",
        "<if test='parentTaskId != null'>AND parent_task_id = #{parentTaskId}</if>",
        "<if test='keyword != null and keyword != \"\"'>",
        "AND (title LIKE CONCAT('%', #{keyword}, '%') OR description LIKE CONCAT('%', #{keyword}, '%'))",
        "</if>",
        "<if test='todayOnly == true'>",
        "AND DATE(due_date) = CURDATE()",
        "</if>",
        "<if test='overdueOnly == true'>",
        "AND due_date &lt; NOW() AND status NOT IN ('completed', 'cancelled')",
        "</if>",
          "<if test='tagNames != null and tagNames.size() > 0'>",
        "AND (",
        "<foreach collection='tagNames' item='tagName' separator=' OR '>",
        "tags LIKE CONCAT('%', #{tagName}, '%')",
        "</foreach>",
        ")",
        "</if>",
        "ORDER BY ",
        "<choose>",
        "<when test='sortBy == \"createdAt\" and sortDirection == \"asc\"'>created_at ASC</when>",
        "<when test='sortBy == \"createdAt\" and sortDirection == \"desc\"'>created_at DESC</when>",
        "<when test='sortBy == \"dueDate\" and sortDirection == \"asc\"'>due_date ASC</when>",
        "<when test='sortBy == \"dueDate\" and sortDirection == \"desc\"'>due_date DESC</when>",
        "<when test='sortBy == \"priority\" and sortDirection == \"asc\"'>priority ASC</when>",
        "<when test='sortBy == \"priority\" and sortDirection == \"desc\"'>priority DESC</when>",
        "<when test='sortBy == \"sortOrder\" and sortDirection == \"asc\"'>sort_order ASC</when>",
        "<when test='sortBy == \"sortOrder\" and sortDirection == \"desc\"'>sort_order DESC</when>",
        "<otherwise>sort_order ASC, created_at DESC</otherwise>",
        "</choose>",
        "</script>"
    })
    IPage<Task> findByConditions(Page<Task> page,
                               @Param("userId") Long userId,
                               @Param("status") Task.TaskStatus status,
                               @Param("priority") Task.Priority priority,
                               @Param("categoryId") Long categoryId,
                               @Param("parentTaskId") Long parentTaskId,
                               @Param("keyword") String keyword,
                               @Param("todayOnly") Boolean todayOnly,
                               @Param("overdueOnly") Boolean overdueOnly,
                               @Param("tagIds") List<Long> tagIds,
                               @Param("tagNames") List<String> tagNames,
                               @Param("sortBy") String sortBy,
                               @Param("sortDirection") String sortDirection);
}