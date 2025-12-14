package com.tomato.todo.backend.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.tomato.todo.backend.entity.Pomodoro;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 番茄钟数据访问层
 *
 * @author Tomato Todo Team
 * @version 1.0.0
 */
@Mapper
public interface PomodoroRepository extends BaseMapper<Pomodoro> {

    /**
     * 分页查询用户番茄钟记录
     */
    @Select("SELECT * FROM t_pomodoro WHERE user_id = #{userId} AND deleted = 0 ORDER BY started_at DESC")
    IPage<Pomodoro> findByUserIdWithPage(Page<Pomodoro> page, @Param("userId") Long userId);

    /**
     * 根据任务ID查询番茄钟记录
     */
    @Select("SELECT * FROM t_pomodoro WHERE task_id = #{taskId} AND deleted = 0 ORDER BY started_at DESC")
    List<Pomodoro> findByTaskId(@Param("taskId") Long taskId);

    /**
     * 根据类型查询用户番茄钟记录
     */
    @Select("SELECT * FROM t_pomodoro WHERE user_id = #{userId} AND type = #{type} AND deleted = 0 ORDER BY started_at DESC")
    List<Pomodoro> findByUserIdAndType(@Param("userId") Long userId, @Param("type") Pomodoro.PomodoroType type);

    /**
     * 查询指定日期范围的番茄钟记录
     */
    @Select("SELECT * FROM t_pomodoro WHERE user_id = #{userId} AND started_at BETWEEN #{startDate} AND #{endDate} AND deleted = 0 ORDER BY started_at DESC")
    List<Pomodoro> findByUserIdAndDateRange(@Param("userId") Long userId, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    /**
     * 查询今日番茄钟记录
     */
    @Select("SELECT * FROM t_pomodoro WHERE user_id = #{userId} AND DATE(started_at) = DATE(#{date}) AND deleted = 0 ORDER BY started_at DESC")
    List<Pomodoro> findTodayPomodoros(@Param("userId") Long userId, @Param("date") LocalDate date);

    /**
     * 统计用户今日各种类型番茄钟数量
     */
    @Select("SELECT type, COUNT(*) as count FROM t_pomodoro WHERE user_id = #{userId} AND DATE(started_at) = DATE(#{date}) AND deleted = 0 GROUP BY type")
    List<java.util.Map<String, Object>> countTodayByType(@Param("userId") Long userId, @Param("date") LocalDate date);

    /**
     * 统计用户今日专注总时长
     */
    @Select("SELECT SUM(actual_duration) FROM t_pomodoro WHERE user_id = #{userId} AND type = 'work' AND is_completed = 1 AND DATE(started_at) = DATE(#{date}) AND deleted = 0")
    Integer sumTodayFocusTime(@Param("userId") Long userId, @Param("date") LocalDate date);

    /**
     * 查询最近的番茄钟记录
     */
    @Select("SELECT * FROM t_pomodoro WHERE user_id = #{userId} AND deleted = 0 ORDER BY started_at DESC LIMIT #{limit}")
    List<Pomodoro> findRecentPomodoros(@Param("userId") Long userId, @Param("limit") Integer limit);

    /**
     * 查询进行中的番茄钟
     */
    @Select("SELECT * FROM t_pomodoro WHERE user_id = #{userId} AND is_completed = 0 AND ended_at IS NULL AND deleted = 0 ORDER BY started_at DESC LIMIT 1")
    Pomodoro findActivePomodoro(@Param("userId") Long userId);

    /**
     * 获取用户番茄钟统计（按天）
     */
    @Select("SELECT DATE(started_at) as date, COUNT(*) as total_count, SUM(actual_duration) as total_duration, " +
            "SUM(CASE WHEN is_completed = 1 THEN 1 ELSE 0 END) as completed_count " +
            "FROM t_pomodoro WHERE user_id = #{userId} AND started_at >= #{startDate} AND deleted = 0 " +
            "GROUP BY DATE(started_at) ORDER BY date DESC")
    List<java.util.Map<String, Object>> getDailyStatistics(@Param("userId") Long userId, @Param("startDate") LocalDateTime startDate);

    /**
     * 统计指定时间段内的工作番茄钟数量
     */
    @Select("SELECT COUNT(*) FROM t_pomodoro WHERE user_id = #{userId} AND type = 'work' AND started_at BETWEEN #{startDate} AND #{endDate} AND deleted = 0")
    long countWorkPomodorosByDateRange(@Param("userId") Long userId, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    /**
     * 统计指定时间段内的总专注时长
     */
    @Select("SELECT SUM(actual_duration) FROM t_pomodoro WHERE user_id = #{userId} AND type = 'work' AND is_completed = 1 AND started_at BETWEEN #{startDate} AND #{endDate} AND deleted = 0")
    Integer sumFocusTimeByDateRange(@Param("userId") Long userId, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
}