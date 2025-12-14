package com.tomato.todo.backend.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.tomato.todo.backend.entity.Statistics;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * 数据统计数据访问层
 *
 * @author Tomato Todo Team
 * @version 1.0.0
 */
@Mapper
public interface StatisticsRepository extends BaseMapper<Statistics> {

    /**
     * 查询用户指定日期的统计数据
     */
    @Select("SELECT * FROM t_statistics WHERE user_id = #{userId} AND stat_date = #{statDate} AND deleted = 0")
    Statistics findByUserIdAndDate(@Param("userId") Long userId, @Param("statDate") LocalDate statDate);

    /**
     * 查询用户指定日期范围的统计数据
     */
    @Select("SELECT * FROM t_statistics WHERE user_id = #{userId} AND stat_date BETWEEN #{startDate} AND #{endDate} AND deleted = 0 ORDER BY stat_date DESC")
    List<Statistics> findByUserIdAndDateRange(@Param("userId") Long userId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    /**
     * 查询用户最近的统计数据
     */
    @Select("SELECT * FROM t_statistics WHERE user_id = #{userId} AND deleted = 0 ORDER BY stat_date DESC LIMIT #{limit}")
    List<Statistics> findRecentByUserId(@Param("userId") Long userId, @Param("limit") Integer limit);

    /**
     * 查询用户总统计数据
     */
    @Select("SELECT " +
            "COUNT(*) as total_days, " +
            "SUM(total_tasks) as total_tasks, " +
            "SUM(completed_tasks) as completed_tasks, " +
            "SUM(total_pomodoros) as total_pomodoros, " +
            "SUM(total_focus_time) as total_focus_time, " +
            "AVG(completion_rate) as avg_completion_rate " +
            "FROM t_statistics WHERE user_id = #{userId} AND deleted = 0")
    Map<String, Object> getTotalStatisticsByUserId(@Param("userId") Long userId);

    /**
     * 查询用户本周统计数据
     */
    @Select("SELECT * FROM t_statistics WHERE user_id = #{userId} AND stat_date >= #{weekStart} AND stat_date <= #{weekEnd} AND deleted = 0 ORDER BY stat_date ASC")
    List<Statistics> findWeeklyStatistics(@Param("userId") Long userId, @Param("weekStart") LocalDate weekStart, @Param("weekEnd") LocalDate weekEnd);

    /**
     * 查询用户本月统计数据
     */
    @Select("SELECT * FROM t_statistics WHERE user_id = #{userId} AND YEAR(stat_date) = #{year} AND MONTH(stat_date) = #{month} AND deleted = 0 ORDER BY stat_date ASC")
    List<Statistics> findMonthlyStatistics(@Param("userId") Long userId, @Param("year") Integer year, @Param("month") Integer month);

    /**
     * 查询用户年度统计数据
     */
    @Select("SELECT " +
            "MONTH(stat_date) as month, " +
            "SUM(total_tasks) as total_tasks, " +
            "SUM(completed_tasks) as completed_tasks, " +
            "SUM(total_pomodoros) as total_pomodoros, " +
            "SUM(total_focus_time) as total_focus_time, " +
            "AVG(completion_rate) as avg_completion_rate " +
            "FROM t_statistics WHERE user_id = #{userId} AND YEAR(stat_date) = #{year} AND deleted = 0 " +
            "GROUP BY MONTH(stat_date) ORDER BY month")
    List<Map<String, Object>> findYearlyStatistics(@Param("userId") Long userId, @Param("year") Integer year);

    /**
     * 获取用户最佳专注时段统计
     */
    @Select("SELECT best_focus_hour, COUNT(*) as count FROM t_statistics WHERE user_id = #{userId} AND best_focus_hour IS NOT NULL AND deleted = 0 GROUP BY best_focus_hour ORDER BY count DESC LIMIT 1")
    Map<String, Object> getBestFocusHour(@Param("userId") Long userId);

    /**
     * 计算用户平均完成率
     */
    @Select("SELECT AVG(completion_rate) FROM t_statistics WHERE user_id = #{userId} AND deleted = 0")
    Double getAverageCompletionRate(@Param("userId") Long userId);

    /**
     * 查询任务分类分布统计
     */
    @Select("SELECT c.name, COUNT(t.id) as task_count, SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as completed_count " +
            "FROM t_category c LEFT JOIN t_task t ON c.id = t.category_id AND t.user_id = #{userId} AND t.deleted = 0 " +
            "WHERE c.user_id = #{userId} AND c.deleted = 0 " +
            "GROUP BY c.id, c.name ORDER BY task_count DESC")
    List<Map<String, Object>> getCategoryDistribution(@Param("userId") Long userId);

    /**
     * 查询任务优先级分布统计
     */
    @Select("SELECT " +
            "priority, " +
            "COUNT(*) as total_count, " +
            "SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_count " +
            "FROM t_task WHERE user_id = #{userId} AND deleted = 0 " +
            "GROUP BY priority")
    List<Map<String, Object>> getPriorityDistribution(@Param("userId") Long userId);

    /**
     * 查询最近7天的统计数据
     */
    @Select("SELECT * FROM t_statistics WHERE user_id = #{userId} AND stat_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) AND deleted = 0 ORDER BY stat_date ASC")
    List<Statistics> findLast7DaysStatistics(@Param("userId") Long userId);

    /**
     * 查询最近30天的统计数据
     */
    @Select("SELECT * FROM t_statistics WHERE user_id = #{userId} AND stat_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) AND deleted = 0 ORDER BY stat_date ASC")
    List<Statistics> findLast30DaysStatistics(@Param("userId") Long userId);

    /**
     * 检查统计数据是否存在
     */
    @Select("SELECT COUNT(*) > 0 FROM t_statistics WHERE user_id = #{userId} AND stat_date = #{statDate} AND deleted = 0")
    boolean existsByUserIdAndDate(@Param("userId") Long userId, @Param("statDate") LocalDate statDate);
}