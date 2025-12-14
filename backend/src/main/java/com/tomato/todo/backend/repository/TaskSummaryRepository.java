package com.tomato.todo.backend.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.tomato.todo.backend.entity.TaskSummary;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 任务总结数据访问层
 *
 * @author Tomato Todo Team
 * @version 1.0.0
 */
@Mapper
public interface TaskSummaryRepository extends BaseMapper<TaskSummary> {

    /**
     * 分页查询用户任务总结
     */
    @Select("SELECT ts.*, t.title as task_title, t.description as task_description " +
            "FROM t_task_summary ts " +
            "JOIN t_task t ON ts.task_id = t.id " +
            "WHERE ts.user_id = #{userId} AND ts.deleted = 0 " +
            "ORDER BY ts.created_at DESC")
    IPage<Map<String, Object>> findByUserIdWithPage(Page<Map<String, Object>> page, @Param("userId") Long userId);

    /**
     * 根据任务ID查询总结
     */
    @Select("SELECT * FROM t_task_summary WHERE task_id = #{taskId} AND deleted = 0 ORDER BY created_at DESC")
    List<TaskSummary> findByTaskId(@Param("taskId") Long taskId);

    /**
     * 根据评价查询用户总结
     */
    @Select("SELECT ts.*, t.title as task_title " +
            "FROM t_task_summary ts " +
            "JOIN t_task t ON ts.task_id = t.id " +
            "WHERE ts.user_id = #{userId} AND ts.rating = #{rating} AND ts.deleted = 0 " +
            "ORDER BY ts.created_at DESC")
    List<Map<String, Object>> findByUserIdAndRating(@Param("userId") Long userId, @Param("rating") TaskSummary.Rating rating);

    /**
     * 根据心情查询用户总结
     */
    @Select("SELECT ts.*, t.title as task_title " +
            "FROM t_task_summary ts " +
            "JOIN t_task t ON ts.task_id = t.id " +
            "WHERE ts.user_id = #{userId} AND ts.mood = #{mood} AND ts.deleted = 0 " +
            "ORDER BY ts.created_at DESC")
    List<Map<String, Object>> findByUserIdAndMood(@Param("userId") Long userId, @Param("mood") TaskSummary.Mood mood);

    /**
     * 根据难度查询用户总结
     */
    @Select("SELECT ts.*, t.title as task_title " +
            "FROM t_task_summary ts " +
            "JOIN t_task t ON ts.task_id = t.id " +
            "WHERE ts.user_id = #{userId} AND ts.difficulty = #{difficulty} AND ts.deleted = 0 " +
            "ORDER BY ts.created_at DESC")
    List<Map<String, Object>> findByUserIdAndDifficulty(@Param("userId") Long userId, @Param("difficulty") TaskSummary.Difficulty difficulty);

    /**
     * 查询指定日期范围的总结
     */
    @Select("SELECT ts.*, t.title as task_title " +
            "FROM t_task_summary ts " +
            "JOIN t_task t ON ts.task_id = t.id " +
            "WHERE ts.user_id = #{userId} AND ts.created_at BETWEEN #{startDate} AND #{endDate} AND ts.deleted = 0 " +
            "ORDER BY ts.created_at DESC")
    List<Map<String, Object>> findByUserIdAndDateRange(@Param("userId") Long userId, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    /**
     * 查询今日总结
     */
    @Select("SELECT ts.*, t.title as task_title " +
            "FROM t_task_summary ts " +
            "JOIN t_task t ON ts.task_id = t.id " +
            "WHERE ts.user_id = #{userId} AND DATE(ts.created_at) = DATE(#{date}) AND ts.deleted = 0 " +
            "ORDER BY ts.created_at DESC")
    List<Map<String, Object>> findTodaySummaries(@Param("userId") Long userId, @Param("date") LocalDate date);

    /**
     * 查询最近总结
     */
    @Select("SELECT ts.*, t.title as task_title " +
            "FROM t_task_summary ts " +
            "JOIN t_task t ON ts.task_id = t.id " +
            "WHERE ts.user_id = #{userId} AND ts.deleted = 0 " +
            "ORDER BY ts.created_at DESC LIMIT #{limit}")
    List<Map<String, Object>> findRecentSummaries(@Param("userId") Long userId, @Param("limit") Integer limit);

    /**
     * 统计用户评价分布
     */
    @Select("SELECT rating, COUNT(*) as count FROM t_task_summary WHERE user_id = #{userId} AND deleted = 0 GROUP BY rating ORDER BY count DESC")
    List<Map<String, Object>> getRatingDistribution(@Param("userId") Long userId);

    /**
     * 统计用户心情分布
     */
    @Select("SELECT mood, COUNT(*) as count FROM t_task_summary WHERE user_id = #{userId} AND deleted = 0 GROUP BY mood ORDER BY count DESC")
    List<Map<String, Object>> getMoodDistribution(@Param("userId") Long userId);

    /**
     * 统计用户难度分布
     */
    @Select("SELECT difficulty, COUNT(*) as count FROM t_task_summary WHERE user_id = #{userId} AND deleted = 0 GROUP BY difficulty ORDER BY count DESC")
    List<Map<String, Object>> getDifficultyDistribution(@Param("userId") Long userId);

    /**
     * 统计用户专注度分布
     */
    @Select("SELECT focus_level, COUNT(*) as count FROM t_task_summary WHERE user_id = #{userId} AND deleted = 0 GROUP BY focus_level ORDER BY count DESC")
    List<Map<String, Object>> getFocusLevelDistribution(@Param("userId") Long userId);

    /**
     * 查询用户平均评价
     */
    @Select("SELECT " +
            "AVG(CASE WHEN rating = 'excellent' THEN 4 WHEN rating = 'good' THEN 3 WHEN rating = 'average' THEN 2 WHEN rating = 'poor' THEN 1 ELSE 0 END) as avg_rating " +
            "FROM t_task_summary WHERE user_id = #{userId} AND deleted = 0")
    Double getAverageRating(@Param("userId") Long userId);

    /**
     * 查询用户总结总数
     */
    @Select("SELECT COUNT(*) FROM t_task_summary WHERE user_id = #{userId} AND deleted = 0")
    Long countByUserId(@Param("userId") Long userId);

    /**
     * 按标签统计总结数量
     */
    @Select("SELECT " +
            "TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(tags, ',', numbers.n), ',', -1)) as tag, " +
            "COUNT(*) as count " +
            "FROM t_task_summary " +
            "JOIN (SELECT 1 n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5) numbers " +
            "ON CHAR_LENGTH(tags) - CHAR_LENGTH(REPLACE(tags, ',', '')) >= numbers.n - 1 " +
            "WHERE user_id = #{userId} AND tags IS NOT NULL AND tags != '' AND deleted = 0 " +
            "GROUP BY tag ORDER BY count DESC LIMIT 20")
    List<Map<String, Object>> getTagDistribution(@Param("userId") Long userId);

    /**
     * 检查任务是否存在总结
     */
    @Select("SELECT COUNT(*) > 0 FROM t_task_summary WHERE task_id = #{taskId} AND deleted = 0")
    boolean existsByTaskId(@Param("taskId") Long taskId);

    /**
     * 按月份统计总结数量
     */
    @Select("SELECT " +
            "YEAR(created_at) as year, " +
            "MONTH(created_at) as month, " +
            "COUNT(*) as count " +
            "FROM t_task_summary WHERE user_id = #{userId} AND deleted = 0 " +
            "GROUP BY YEAR(created_at), MONTH(created_at) " +
            "ORDER BY year DESC, month DESC LIMIT 12")
    List<Map<String, Object>> getMonthlySummaryCount(@Param("userId") Long userId);
}